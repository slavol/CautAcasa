import express from "express";
import prisma from "../config/prisma.js";
import {authRequired} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================
   GET User History
====================== */
router.get("/", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { visitedAt: "desc" },
      include: {
        listing: {
          include: { ai: true }
        }
      }
    });

    res.json({ history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


/* ======================
   ADD history entry (auto tracking)
====================== */
router.post("/:listingId", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = parseInt(req.params.listingId);

    // verificăm dacă listing-ul există
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // evităm duplicatele în aceeași zi
    const today = new Date();
    today.setHours(0,0,0,0);

    const existing = await prisma.history.findFirst({
      where: {
        userId,
        listingId,
        visitedAt: {
          gte: today
        }
      }
    });

    if (!existing) {
      await prisma.history.create({
        data: { userId, listingId }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;