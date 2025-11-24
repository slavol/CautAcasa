import prisma from "../config/prisma.js";

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = parseInt(req.params.listingId);

    // verificăm dacă listingul există
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // adaugă în favorite, dacă nu există deja
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_listingId: { userId, listingId }
      },
      update: {}, // nimic de actualizat
      create: { userId, listingId }
    });

    res.json({ message: "Added to favorites", favorite });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = parseInt(req.params.listingId);

    await prisma.favorite.delete({
      where: {
        userId_listingId: { userId, listingId }
      }
    });

    res.json({ message: "Removed from favorites" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            ai: true // includem datele AI -> cleanTitle, priceRON, rooms etc
          }
        }
      }
    });

    res.json({ favorites });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};