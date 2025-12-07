import express from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../middleware/authMiddleware.js";
import { rankListingsWithGemini } from "../ai/rankListings.js";

const aiRouter = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/ai/chat
 * Trimite un mesaj AI + salvează conversația într-o sesiune
 */
aiRouter.post("/chat", authRequired, async (req, res) => {
  try {
    const userId = req.user.id; // vine automat din authRequired
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message este obligatoriu" });
    }

    // -------------------------------------------------------------------
    // 1) PRELUĂM LISTINGURILE CANDIDATE
    // -------------------------------------------------------------------
    const listingAIs = await prisma.listingAI.findMany({
      take: 100,
      include: { Listing: true },
      orderBy: { updatedAt: "desc" }
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

    // -------------------------------------------------------------------
    // 2) CEREM GEMINI SĂ RANKUIASCĂ ANUNȚURILE
    // -------------------------------------------------------------------
    const aiResult = await rankListingsWithGemini({
      userQuery: message,
      listings: candidates,
    });

    const topIds = aiResult.topListings?.map((t) => t.id) || [];

    const recommended = listingAIs.filter((l) =>
      topIds.includes(l.listingId)
    );

    // -------------------------------------------------------------------
    // 3) GĂSIM SAU CREĂM SESIUNEA DE CHAT
    // -------------------------------------------------------------------
    let session = null;

    if (chatId) {
      const parsedId = Number(chatId);
      if (!isNaN(parsedId)) {
        session = await prisma.chatSession.findFirst({
          where: { id: parsedId, userId }
        });
      }
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.slice(0, 60)
        }
      });
    }

    // -------------------------------------------------------------------
    // 4) SALVĂM MESAJUL USERULUI
    // -------------------------------------------------------------------
    await prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: "USER",
        content: message
      }
    });

    // -------------------------------------------------------------------
    // 5) SALVĂM MESAJUL AI + LISTINGS ÎN METADATA
    // -------------------------------------------------------------------
    await prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: "ASSISTANT",
        content: aiResult.replyText, // DOAR text curat

        metadata: {
          topListings: aiResult.topListings,
          listings: recommended.map((l) => ({
            id: l.listingId,
            cleanTitle: l.cleanTitle,
            priceEUR: l.priceEUR,
            image: l.image,
            link: l.link,
          })),
        },
      },
    });

    // -------------------------------------------------------------------
    // 6) RĂSPUNDEM LA FRONTEND
    // -------------------------------------------------------------------
    return res.json({
      chatId: session.id,
      replyText: aiResult.replyText,
      topListings: aiResult.topListings,
      listings: recommended,
    });

  } catch (error) {
    console.error("EROARE /api/ai/chat:", error);
    return res.status(500).json({
      error: "A apărut o eroare la AI",
      details: error.message
    });
  }
});

export default aiRouter;