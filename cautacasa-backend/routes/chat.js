// routes/chat.js
import express from "express";
import prisma from "../config/prisma.js";
import { authRequired } from "../middleware/authMiddleware.js";
import { rankListingsWithGemini } from "../ai/rankListings.js";
import { extractAiFilters } from "../utils/aiextractor.js";

const chatRouter = express.Router();

/* -----------------------------------------------------
   GET LISTA SESIUNI
----------------------------------------------------- */
chatRouter.get("/list", authRequired, async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ sessions });
  } catch (err) {
    console.error("ERROR /chat/list:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------------------------------
   GET MESAJE DINTR-O SESIUNE
----------------------------------------------------- */
chatRouter.get("/:id/messages", authRequired, async (req, res) => {
  try {
    const chatId = Number(req.params.id);

    if (!chatId || isNaN(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatSessionId: chatId },
      orderBy: { createdAt: "asc" },
    });

    const formatted = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      listings: msg.metadata?.listings || [],
    }));

    return res.json({ messages: formatted });
  } catch (err) {
    console.error("ERROR /chat/:id/messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------------------------------
   SEND A MESSAGE TO AI
----------------------------------------------------- */
chatRouter.post("/send", authRequired, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const numericChatId =
      chatId && !isNaN(Number(chatId)) ? Number(chatId) : null;

    let session = null;

    if (numericChatId) {
      session = await prisma.chatSession.findFirst({
        where: { id: numericChatId, userId },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.slice(0, 50),
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: "USER",
        content: message,
      },
    });

    /* -------------------------
       PRELUARE LISTINGS PENTRU AI
    -------------------------- */
    const listingAIs = await prisma.listingAI.findMany({
      include: { Listing: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const candidates = listingAIs.map((l) => ({
      id: l.listingId,
      title: l.cleanTitle || l.Listing.title,
      description: l.summary || l.Listing.description,
      city: l.city || l.Listing.city,
      zone: l.zone,
      rooms: l.rooms,
      transaction: l.transaction || l.Listing.transaction,
      priceRON: l.priceRON,
      priceEUR: l.priceEUR,
      link: l.link || l.Listing.link,
    }));

    /* -------------------------
       EXECUTĂ MODELUL AI
    -------------------------- */
    const aiResult = await rankListingsWithGemini({
      userQuery: message,
      listings: candidates,
    });

    const topIds = aiResult.topListings.map((x) => x.id);

    const recommended = await prisma.listingAI.findMany({
      where: { listingId: { in: topIds } },
      include: { Listing: true },
    });

    // SALVEAZĂ LOG INTEROGARE AI
    await prisma.aiQueryLog.create({
      data: {
        userId,
        message, // întrebarea userului
      },
    });

    /* -------------------------
       SALVARE MESAJ AI + ANUNȚURI
    -------------------------- */
    await prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: "ASSISTANT",
        content: aiResult.replyText,
        metadata: {
          listings: recommended,
        },
      },
    });

    // -----------------------------------------
    // AI FILTER EXTRACTION → AI QUERY LOG SAVE
    // -----------------------------------------
    try {
      const extracted = extractAiFilters(message);

      await prisma.aiQueryLog.create({
        data: {
          userId,
          message,
          rooms: extracted.rooms,
          propertyType: extracted.propertyType,
          transaction: extracted.transaction,
          city: extracted.city,
        },
      });

    } catch (err) {
      console.error("AI Query extraction failed:", err);
    }

    /* -------------------------
       RĂSPUNS CĂTRE FRONTEND
    -------------------------- */
    return res.json({
      chatId: session.id,
      replyText: aiResult.replyText,
      listings: recommended,
    });
  } catch (err) {
    console.error("ERROR /chat/send:", err);
    res.status(500).json({ error: "Chat send failed" });
  }
});

export default chatRouter;