import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      q,
      transaction,
      minRooms,
      maxRooms,
      minPrice,
      maxPrice,
      priceType,   // "RON" sau "EUR"
      zone,
      city,
      isOwner,
      hasAI
    } = req.query;

    // ------------------------------------
    // WHERE CONDITIONAL OBJECT
    // ------------------------------------

    const where = {
      ai: hasAI === "true" ? { NOT: null } : undefined,
      transaction: transaction || undefined,
      city: city || undefined,
    };

    // ZONE
    if (zone) {
      where.ai = {
        ...where.ai,
        zone: { contains: zone, mode: "insensitive" }
      };
    }

    // PROPRIETAR SAU AGENTIE
    if (isOwner === "true") {
      where.ai = {
        ...where.ai,
        isOwner: true
      };
    }
    if (isOwner === "false") {
      where.ai = {
        ...where.ai,
        isOwner: false
      };
    }

    // CAMERE
    if (minRooms || maxRooms) {
      where.ai = {
        ...where.ai,
        rooms: {}
      };
      if (minRooms) where.ai.rooms.gte = Number(minRooms);
      if (maxRooms) where.ai.rooms.lte = Number(maxRooms);
    }

    // PRICE (RON / EUR)
    if (minPrice || maxPrice) {
      const priceField = priceType === "RON" ? "priceRON" : "priceEUR";

      where.ai = {
        ...where.ai,
        [priceField]: {}
      };

      if (minPrice) where.ai[priceField].gte = Number(minPrice);
      if (maxPrice) where.ai[priceField].lte = Number(maxPrice);
    }

    // SEARCH in cleanTitle + summary + propertyType
    if (q && q.trim() !== "") {
      where.OR = [
        { ai: { cleanTitle: { contains: q, mode: "insensitive" } } },
        { ai: { summary: { contains: q, mode: "insensitive" } } },
        { ai: { propertyType: { contains: q, mode: "insensitive" } } },
      ];
    }

    // ------------------------------------
    // QUERY PRISMA
    // ------------------------------------

    const results = await prisma.listing.findMany({
      where,
      include: {
        ai: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50 // poți mări/lăsa infinit
    });

    res.json({ results });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;