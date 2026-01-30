import express from "express";
import prisma from "../config/prisma.js";

const listingsRouter = express.Router();

// GET /api/listings
listingsRouter.get("/", async (req, res) => {
  try {
    console.log("--- REQUEST NOU ---");
    console.log("Parametrii primiți:", req.query);

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
      limit = 9
    } = req.query;

    // Construim filtrul (WHERE)
    const where = {};

    // 1. Căutare (Titlu, Oras)
    if (q && q.trim() !== "") {
      where.OR = [
        { cleanTitle: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } }
      ];
    }

    // 2. Preț (Verificăm să fie număr valid)
    if (priceMin || priceMax) {
      where.priceEUR = {};
      if (priceMin) where.priceEUR.gte = Number(priceMin);
      if (priceMax) where.priceEUR.lte = Number(priceMax);
    }

    // 3. Camere
    if (roomsMin || roomsMax) {
      where.rooms = {};
      if (roomsMin) where.rooms.gte = Number(roomsMin);
      if (roomsMax) where.rooms.lte = Number(roomsMax);
    }

    // 4. Tip & Tranzacție
    if (propertyType && propertyType.trim() !== "") {
      where.propertyType = { contains: propertyType, mode: "insensitive" };
    }
    if (transaction && transaction.trim() !== "") {
      where.transaction = transaction; // Trebuie să fie exact (RENT/SALE)
    }

    // 5. Proprietar vs Agenție
    if (isOwner === "true") {
      where.isOwner = true;
    } else if (isOwner === "false") {
      // Includem și NULL (nedetectat) la Agenții
      where.OR = [
        ...(where.OR || []), // Păstrăm OR-ul de la search text dacă există
        { isOwner: false },
        { isOwner: null }
      ];
      // Notă: Dacă ai și Search Text ȘI Agenție, logica de mai sus cu OR combinat
      // poate fi tricky. Pentru moment, simplificăm:
      // Dacă există deja un OR (de la text), prisma nu acceptă două OR-uri la nivel root ușor.
      // Pentru stabilitate acum, dacă userul caută text, ignorăm filtrarea strictă pe agenție
      // sau folosim AND explicit. Dar să vedem dacă merge simplu întâi.
      
      // FIX SIGUR PENTRU OR MULTIPLU:
      if (q && q.trim() !== "") {
          // Dacă avem deja search, folosim AND pentru a adăuga condiția de agenție
           where.AND = [
               { OR: [ { isOwner: false }, { isOwner: null } ] }
           ];
      } else {
          // Dacă nu avem search, putem folosi OR direct
          where.OR = [ { isOwner: false }, { isOwner: null } ];
      }
    }

    console.log("Filtre aplicate (WHERE):", JSON.stringify(where, null, 2));

    // Paginare
    const take = Number(limit) || 9;
    const skip = (Number(page) - 1) * take;

    // Query DB
    const [listings, total] = await Promise.all([
      prisma.listingAI.findMany({
        where: where,
        take: take,
        skip: skip,
        orderBy: { id: "desc" },
        include: { Listing: true } // Aducem imaginea originală
      }),
      prisma.listingAI.count({ where: where })
    ]);

    console.log(`Găsite: ${total} anunțuri.`);

    res.json({
      listings,
      total,
      totalPages: Math.ceil(total / take),
      page: Number(page)
    });

  } catch (error) {
    console.error("EROARE CRITICĂ BACKEND:", error);
    // Trimitem un răspuns gol valid ca să nu crape frontend-ul
    res.json({ listings: [], total: 0, totalPages: 0, page: 1 });
  }
});

// GET Listing by ID
listingsRouter.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const item = await prisma.listingAI.findUnique({
            where: { id },
            include: { Listing: true }
        });
        if (item) return res.json(item);
        return res.status(404).json({error: "Nu exista"});
    } catch(e) {
        res.status(500).json({error: "Err"});
    }
});

export default listingsRouter;