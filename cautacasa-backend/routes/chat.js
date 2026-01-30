import express from "express";
import prisma from "../config/prisma.js";
import { authRequired } from "../middleware/authMiddleware.js";
import { extractFiltersWithLocalAI, generateChatResponse } from "../ai/localAiClient.js";

const chatRouter = express.Router();

chatRouter.get("/list", authRequired, async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({ 
      where: { userId: req.user.id }, 
      orderBy: { createdAt: "desc" } 
    });
    res.json({ sessions });
  } catch (e) { res.status(500).json({ error: "Err" }); }
});

// GET MESSAGES
chatRouter.get("/:id/messages", authRequired, async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    
    // FIX: Dacă ID-ul nu e un număr valid (ex: "list", "new", "undefined"), oprim execuția.
    if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid Chat ID" });
    }
    
    const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: req.user.id }
    });

    if (!session) return res.status(403).json({ error: "Acces interzis" });

    const messages = await prisma.chatMessage.findMany({ 
      where: { chatSessionId: sessionId }, 
      orderBy: { createdAt: "asc" } 
    });
    
    const formatted = messages.map(m => ({ role: m.role, content: m.content, listings: m.metadata?.listings || [] }));
    res.json({ messages: formatted });
  } catch (e) { 
      console.error("GET MESSAGES ERROR:", e);
      res.status(500).json({ error: "Server error" }); 
  }
});

// POST SEND - MEMORIE PERSISTENTĂ
chatRouter.post("/send", authRequired, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id;

    if (!message) return res.status(400).json({ error: "Message required" });

    // 1. Sesiune
    let session = null;
    const sId = chatId ? Number(chatId) : null;
    if (sId && !isNaN(sId)) {
      session = await prisma.chatSession.findFirst({ where: { id: sId, userId } });
    }
    if (!session) {
      session = await prisma.chatSession.create({ data: { userId, title: message.slice(0, 30) } });
    }

    // 2. RECUPERĂM STATE-UL ANTERIOR (Filtrele active)
    const lastAiMsg = await prisma.chatMessage.findFirst({
      where: { chatSessionId: session.id, role: 'ASSISTANT' },
      orderBy: { createdAt: 'desc' }
    });
    
    // Luăm filtrele vechi din metadata (dacă există)
    const previousFilters = lastAiMsg?.metadata?.activeFilters || {};

    // Salvăm mesajul userului
    await prisma.chatMessage.create({ data: { chatSessionId: session.id, role: "USER", content: message } });

    // 3. AI UPDATEAZA STATE-UL
    console.log("old state:", previousFilters);
    const aiFilters = await extractFiltersWithLocalAI(message, previousFilters);
    console.log("new state from AI:", aiFilters);

    // 4. FUZIUNE DE SIGURANȚĂ (Manual Merge)
    // Dacă AI-ul returnează null la un câmp, dar noi îl aveam setat, îl păstrăm (doar dacă nu pare că userul a vrut să-l șteargă)
    // AI-ul Llama cu prompt-ul nou ar trebui să facă asta singur, dar asta e plasă de siguranță.
    const finalFilters = {
        city: aiFilters?.city || previousFilters.city || null,
        propertyType: aiFilters?.propertyType || previousFilters.propertyType || null,
        transaction: aiFilters?.transaction || previousFilters.transaction || null,
        priceMax: aiFilters?.priceMax || previousFilters.priceMax || null,
        roomsMin: aiFilters?.roomsMin || previousFilters.roomsMin || null,
    };
    
    // Reset Logic: Dacă schimb din Garsonieră în Casă, poate ar trebui să scot rooms=1?
    if (aiFilters?.propertyType && aiFilters.propertyType !== previousFilters.propertyType) {
        if (aiFilters.propertyType !== 'garsoniera') {
            // Dacă noua cerere nu e garsonieră, dar vechea era, scoatem restricția de 1 cameră
             if (finalFilters.roomsMin === 1) finalFilters.roomsMin = null; 
        }
    }
    
    console.log("🧠 FINAL MEMORY:", finalFilters);

    // 5. QUERY DB
    let foundListings = [];
    // Validare: Avem măcar un criteriu?
    if (finalFilters.city || finalFilters.propertyType || finalFilters.priceMax || finalFilters.roomsMin) {
      const where = {};

      if (finalFilters.city) where.city = { contains: finalFilters.city, mode: 'insensitive' };
      
      if (finalFilters.propertyType) {
        if (finalFilters.propertyType.includes('garsoniera')) where.rooms = { equals: 1 };
        else where.propertyType = { contains: finalFilters.propertyType, mode: 'insensitive' };
      }

      if (!where.rooms?.equals && finalFilters.roomsMin) where.rooms = { gte: finalFilters.roomsMin };
      
      if (finalFilters.transaction) where.transaction = finalFilters.transaction;
      
      if (finalFilters.priceMax) {
        where.priceEUR = { lte: finalFilters.priceMax };
        if (!where.transaction) where.transaction = finalFilters.priceMax <= 2000 ? 'RENT' : 'SALE';
      } else if (finalFilters.transaction === 'RENT' || (!finalFilters.transaction && !finalFilters.priceMax)) {
         if (!where.transaction) where.priceEUR = { lte: 2000 }; 
      }

      foundListings = await prisma.listingAI.findMany({
        where: where,
        take: 4,
        orderBy: { priceEUR: 'asc' },
        include: { Listing: true }
      });
    }

    const replyText = await generateChatResponse(message, foundListings);

    // 6. SALVARE NOUL STATE (Pentru tura viitoare)
    await prisma.chatMessage.create({
      data: { 
        chatSessionId: session.id, 
        role: "ASSISTANT", 
        content: replyText, 
        metadata: { 
            listings: foundListings,
            activeFilters: finalFilters // <--- Aici salvam memoria
        } 
      }
    });

    res.json({ chatId: session.id, replyText, listings: foundListings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

chatRouter.delete("/:id", authRequired, async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    if (isNaN(chatId)) return res.status(400).json({ error: "Invalid ID" });

    // 1. Verificăm dacă sesiunea aparține userului (Securitate)
    const session = await prisma.chatSession.findFirst({
      where: { id: chatId, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ error: "Conversația nu a fost găsită sau nu ai acces." });
    }

    // 2. Ștergem mesajele asociate (Prisma ar trebui să facă asta automat dacă ai Cascade, dar facem manual pt siguranță)
    await prisma.chatMessage.deleteMany({
      where: { chatSessionId: chatId }
    });

    // 3. Ștergem sesiunea
    await prisma.chatSession.delete({
      where: { id: chatId }
    });

    res.json({ success: true, message: "Conversație ștersă." });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default chatRouter;