import express from "express";
import prisma from "../config/prisma.js";
import {authRequired} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================
   GET user favorites
====================== */
router.get("/", authRequired, async (req, res) => {
  try {
    const userId = req.user.id; // luat automat din JWT

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: { ai: true }
        }
      }
    });

    res.json({ favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ======================
   ADD favorite
====================== */
router.post("/:listingId", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = parseInt(req.params.listingId);

    const listingExists = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listingExists)
      return res.status(404).json({ error: "Listing not found" });

    const fav = await prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {}
    });

    res.json({ message: "Added to favorites", favorite: fav });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


/* ======================
   REMOVE favorite
====================== */
router.delete("/:listingId", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = parseInt(req.params.listingId);

    await prisma.favorite.deleteMany({
      where: { userId, listingId }
    });

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;