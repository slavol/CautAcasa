import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// === GET ALL AI LISTINGS ===
router.get("/all", async (req, res) => {
  try {
    const listings = await prisma.listingAI.findMany({
      include: {
        Listing: true,
      },
      orderBy: { priceRON: "asc" },
    });

    res.json(listings);
  } catch (err) {
    console.error("Error fetching AI listings:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// === FILTER + PAGINATION ===
router.post("/filter", async (req, res) => {
  try {
    const {
      q,
      propertyType,
      transaction,
      roomsMin,
      roomsMax,
      priceMin,
      priceMax,
      zone,
      isOwner,
      page = 1,
      limit = 20
    } = req.body;

    const filters = {};

    if (q) filters.cleanTitle = { contains: q, mode: "insensitive" };
    if (propertyType) filters.propertyType = propertyType;
    if (transaction) filters.transaction = transaction;
    if (zone) filters.zone = { contains: zone, mode: "insensitive" };
    if (isOwner !== undefined) filters.isOwner = Boolean(isOwner);

    if (roomsMin || roomsMax) {
      filters.rooms = {};
      if (roomsMin) filters.rooms.gte = Number(roomsMin);
      if (roomsMax) filters.rooms.lte = Number(roomsMax);
    }

    if (priceMin || priceMax) {
      filters.priceRON = {};
      if (priceMin) filters.priceRON.gte = Number(priceMin);
      if (priceMax) filters.priceRON.lte = Number(priceMax);
    }

    const skip = (page - 1) * limit;

    const [total, listings] = await Promise.all([
      prisma.listingAI.count({ where: filters }),
      prisma.listingAI.findMany({
        where: filters,
        include: { Listing: true },
        skip,
        take: Number(limit),
        orderBy: { priceRON: "asc" }
      })
    ]);

    res.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("FILTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;