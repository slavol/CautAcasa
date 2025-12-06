import express from "express";
import prisma from "../config/prisma.js";

const listingsRouter = express.Router();

// BASIC GET / (optional filters)
listingsRouter.get("/", async (req, res) => {
  const { city, rooms, priceMin, priceMax } = req.query;

  const filters = {};

  if (city) filters.city = city;
  if (rooms) filters.rooms = Number(rooms);

  if (priceMin || priceMax) {
    filters.priceRON = {};
    if (priceMin) filters.priceRON.gte = Number(priceMin);
    if (priceMax) filters.priceRON.lte = Number(priceMax);
  }

  const data = await prisma.listingAI.findMany({
    where: filters,
    orderBy: { id: "desc" },
  });

  res.json(data);
});

// GET /:id
listingsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const listing = await prisma.listingAI.findUnique({
    where: { id },
  });

  if (!listing) return res.status(404).json({ error: "Listing not found" });

  res.json(listing);
});

listingsRouter.post("/filter", async (req, res) => {
  try {
    const {
      q,
      priceMin,
      priceMax,
      roomsMin,
      roomsMax,
      propertyType,
      transaction,
      isOwner,
      page = 1,
      limit = 10
    } = req.body;

    const filters = {};

    // SEARCH
    if (q && q.trim() !== "") {
      filters.OR = [
        { cleanTitle: { contains: q.trim(), mode: "insensitive" } },
        { summary: { contains: q.trim(), mode: "insensitive" } }
      ];
    }

    // PRICE FILTER (EUR)
    if (priceMin || priceMax) {
      filters.priceEUR = {};
      if (priceMin) filters.priceEUR.gte = Number(priceMin);
      if (priceMax) filters.priceEUR.lte = Number(priceMax);
    }

    // ROOMS
    if (roomsMin || roomsMax) {
      filters.rooms = {};
      if (roomsMin) filters.rooms.gte = Number(roomsMin);
      if (roomsMax) filters.rooms.lte = Number(roomsMax);
    }

    // PROPERTY TYPE
    if (propertyType) filters.propertyType = propertyType;

    // TRANSACTION
    if (transaction) filters.transaction = transaction;

    // OWNER
    if (isOwner === "true") filters.isOwner = true;
    if (isOwner === "false") filters.isOwner = false;

    // PAGINATION
    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      prisma.listingAI.findMany({
        where: filters,
        skip,
        take: Number(limit),
        orderBy: { id: "desc" }
      }),
      prisma.listingAI.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      listings,
      total,
      totalPages,
      page: Number(page)
    });

  } catch (error) {
    console.error("FILTER ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default listingsRouter;