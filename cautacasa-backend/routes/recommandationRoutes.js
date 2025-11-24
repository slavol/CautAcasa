import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    // 1. Obținem ultimele 20 vizite
    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { visitedAt: "desc" },
      take: 20,
      include: {
        listing: {
          include: { ai: true }
        }
      }
    });

    if (history.length === 0) {
      // fallback: recomandări generale
      const trending = await prisma.listing.findMany({
        where: { ai: { NOT: null } },
        include: { ai: true },
        orderBy: [
          { ai: { qualityScore: "desc" } },
          { createdAt: "desc" }
        ],
        take: 20
      });

      return res.json({ recommendations: trending });
    }

    // extragem preferințele dominante
    const preferredZones = {};
    const preferredTypes = {};
    const preferredTransactions = {};

    let avgPrice = 0;
    let priceCount = 0;

    for (const h of history) {
      const ai = h.listing.ai;
      if (!ai) continue;

      if (ai.zone) preferredZones[ai.zone] = (preferredZones[ai.zone] || 0) + 1;
      if (ai.propertyType) preferredTypes[ai.propertyType] = (preferredTypes[ai.propertyType] || 0) + 1;
      if (ai.transaction) preferredTransactions[ai.transaction] = (preferredTransactions[ai.transaction] || 0) + 1;

      if (ai.priceRON) {
        avgPrice += ai.priceRON;
        priceCount++;
      }
    }

    const favoriteZone = Object.entries(preferredZones).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const favoriteType = Object.entries(preferredTypes).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const favoriteTransaction = Object.entries(preferredTransactions).sort((a,b)=>b[1]-a[1])[0]?.[0];

    const budget = priceCount > 0 ? Math.floor(avgPrice / priceCount) : null;

    // 3. căutăm anunțuri similare
    const recommendations = await prisma.listing.findMany({
      where: {
        ai: {
          NOT: null,
          zone: favoriteZone ? { contains: favoriteZone, mode: "insensitive" } : undefined,
          propertyType: favoriteType || undefined,
          transaction: favoriteTransaction || undefined,
          priceRON: budget ? { lte: budget * 1.2, gte: budget * 0.5 } : undefined
        }
      },
      include: { ai: true },
      orderBy: [{ createdAt: "desc" }],
      take: 30
    });

    res.json({ recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

export default router;