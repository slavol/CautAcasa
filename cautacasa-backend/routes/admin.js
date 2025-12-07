// routes/admin.js
import express from "express";
import prisma from "../config/prisma.js";
import { authRequired, adminRequired } from "../middleware/authMiddleware.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const adminRouter = express.Router();

// toate rutele de aici necesită user logat + admin
adminRouter.use(authRequired, adminRequired);

/* =====================================================
   1) STATISTICI AI – Dashboard complet
===================================================== */

adminRouter.get("/stats/ai", async (req, res) => {
  try {
    // Total interogări AI
    const totalQueries = await prisma.aiQueryLog.count();

    // GroupBy Rooms
    const roomsStats = await prisma.aiQueryLog.groupBy({
      by: ["rooms"],
      _count: { _all: true },
      where: { rooms: { not: null } }
    });

    // GroupBy Property Type
    const propertyStats = await prisma.aiQueryLog.groupBy({
      by: ["propertyType"],
      _count: { _all: true },
      where: { propertyType: { not: null } }
    });

    // GroupBy Transaction
    const transactionStats = await prisma.aiQueryLog.groupBy({
      by: ["transaction"],
      _count: { _all: true },
      where: { transaction: { not: null } }
    });

    // GroupBy City
    const cityStats = await prisma.aiQueryLog.groupBy({
      by: ["city"],
      _count: { _all: true },
      where: { city: { not: null } }
    });

    // formatăm pentru frontend
    return res.json({
      totalQueries,
      topRooms: roomsStats
        .sort((a, b) => b._count._all - a._count._all)
        .map(r => ({ rooms: r.rooms, count: r._count._all })),

      topPropertyTypes: propertyStats
        .sort((a, b) => b._count._all - a._count._all)
        .map(p => ({ propertyType: p.propertyType, count: p._count._all })),

      topTransactions: transactionStats
        .sort((a, b) => b._count._all - a._count._all)
        .map(t => ({ transaction: t.transaction, count: t._count._all })),

      topCities: cityStats
        .sort((a, b) => b._count._all - a._count._all)
        .map(c => ({ city: c.city, count: c._count._all })),
    });

  } catch (err) {
    console.error("ERROR /admin/stats/ai:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   2) ADMINISTRARE LISTINGS AI – CRUD + filtre
===================================================== */

// GET /api/admin/listings-ai
adminRouter.get("/listings-ai", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const onlyIncomplete = req.query.onlyIncomplete === "true";

    const incompleteWhere = {
      OR: [
        { cleanTitle: { equals: null } },
        { cleanTitle: { equals: "" } },

        { propertyType: { equals: null } },
        { propertyType: { equals: "" } },

        { transaction: { equals: null } },

        { rooms: { equals: null } },

        { summary: { equals: null } },
        { summary: { equals: "" } },

        { priceEUR: { equals: null } },

        { city: { equals: null } },
        { city: { equals: "" } },

        { image: { equals: null } },
        { image: { equals: "" } },
      ],
    };

    const where = onlyIncomplete ? incompleteWhere : {};

    const [items, total] = await Promise.all([
      prisma.listingAI.findMany({
        where,
        include: { Listing: true },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),

      prisma.listingAI.count({ where })
    ]);

    return res.json({
      items,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("ERROR /admin/listings-ai:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE LISTING AI
// POST /admin/listings-ai
// POST /api/admin/listings-ai
// POST /api/admin/listings-ai
adminRouter.post("/listings-ai", async (req, res) => {
  try {
    const {
      cleanTitle,
      summary,
      city,
      zone,
      rooms,
      transaction,
      propertyType,
      priceRON,
      priceEUR,
      link,
      image
    } = req.body;

    // 1️⃣ Creează Listing original (obligatoriu pentru relația 1-1)
    const listing = await prisma.listing.create({
      data: {
        title: cleanTitle || "Fără titlu",
        description: summary || "",
        city: city || "",
        image: image || null,
        link: link || "",

        // 🔥 AICI TREBUIE EXACT CE PERMITE ENUMUL
        source: "OLX",

        transaction: transaction || "UNKNOWN",
        price: priceEUR ? Number(priceEUR) : null,
        currency: "EUR"
      }
    });

    // 2️⃣ Creează ListingAI legat de Listing
    const created = await prisma.listingAI.create({
      data: {
        listingId: listing.id,
        cleanTitle,
        summary,
        city,
        zone,
        rooms: rooms ? Number(rooms) : null,
        transaction,
        propertyType,
        priceRON: priceRON ? Number(priceRON) : null,
        priceEUR: priceEUR ? Number(priceEUR) : null,
        image,
        link
      }
    });

    res.status(201).json({ item: created });

  } catch (err) {
    console.error("ERROR POST /admin/listings-ai:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE LISTING AI
adminRouter.put("/listings-ai/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // ❗ EXTRAGEM DOAR CÂMPURILE PERMISE
    const {
      cleanTitle,
      propertyType,
      transaction,
      rooms,
      summary,
      priceRON,
      priceEUR,
      city,
      zone,
      image,
      link,
      isOwner,
      qualityScore,
      listingId,
    } = req.body;

    const updated = await prisma.listingAI.update({
      where: { id },
      data: {
        listingId,
        cleanTitle,
        propertyType,
        transaction,
        rooms,
        summary,
        priceRON,
        priceEUR,
        city,
        zone,
        image,
        link,
        isOwner,
        qualityScore,
      },
    });

    return res.json({ item: updated });
  } catch (err) {
    console.error("ERROR PUT /admin/listings-ai/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE LISTING AI
adminRouter.delete("/listings-ai/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });

    await prisma.listingAI.delete({ where: { id } });

    return res.json({ success: true });

  } catch (err) {
    console.error("ERROR DELETE /admin/listings-ai/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   3) SCRAPER SIMULATOR (provizoriu)
===================================================== */

let currentScraperJob = {
  running: false,
  progress: 0,
  lastUpdate: null,
};


adminRouter.post("/scraper/start", async (req, res) => {
  try {
    const scriptPath = path.join(process.cwd(), "scraper/run_all.py");

    const py = spawn("python3", [scriptPath]);

    py.stdout.on("data", (data) => {
      console.log("[SCRAPER]", data.toString());
    });

    py.stderr.on("data", (data) => {
      console.error("[SCRAPER ERROR]", data.toString());
    });

    py.on("close", (code) => {
      console.log("SCRAPER FINISHED WITH CODE", code);
    });

    return res.json({ ok: true, message: "Scraper has started." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start scraper." });
  }
});

adminRouter.get("/scraper/status", (req, res) => {
  try {
    const file = path.join(process.cwd(), "scraper/progress.json");

    if (!fs.existsSync(file)) {
      return res.json({ running: false });
    }

    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    return res.json(data);

  } catch (err) {
    return res.status(500).json({ error: "Cannot read progress" });
  }
});

function simulateScraperProgress() {
  const interval = setInterval(() => {
    if (!currentScraperJob.running) return clearInterval(interval);

    currentScraperJob.progress += 10;
    currentScraperJob.lastUpdate = new Date();

    if (currentScraperJob.progress >= 100) {
      currentScraperJob.running = false;
      currentScraperJob.progress = 100;
      clearInterval(interval);
    }
  }, 1000);
}

export default adminRouter;