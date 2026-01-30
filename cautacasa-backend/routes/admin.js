import express from "express";
import prisma from "../config/prisma.js";
import { authRequired, adminRequired } from "../middleware/authMiddleware.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const adminRouter = express.Router();

adminRouter.use(authRequired, adminRequired);

// --- VARIANTA GLOBALĂ PENTRU PROCESUL SCRAPER ---
// Ne permite să știm dacă rulează și să îl oprim
let activeScraperProcess = null;


// --- STATISTICI ---
adminRouter.get("/stats/ai", async (req, res) => {
  try {
    const totalQueries = await prisma.aiQueryLog.count();

    const roomsStats = await prisma.aiQueryLog.groupBy({
      by: ["rooms"],
      _count: { _all: true },
      where: { rooms: { not: null } }
    });

    const propertyStats = await prisma.aiQueryLog.groupBy({
      by: ["propertyType"],
      _count: { _all: true },
      where: { propertyType: { not: null } }
    });

    const transactionStats = await prisma.aiQueryLog.groupBy({
      by: ["transaction"],
      _count: { _all: true },
      where: { transaction: { not: null } }
    });

    const cityStats = await prisma.aiQueryLog.groupBy({
      by: ["city"],
      _count: { _all: true },
      where: { city: { not: null } }
    });

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

// --- LISTARE ANUNTURI AI (CU SEARCH & FILTRE) ---
adminRouter.get("/listings-ai", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Parametrii de filtrare
    const onlyIncomplete = req.query.onlyIncomplete === "true";
    const search = req.query.search ? String(req.query.search).trim() : null;

    // Construim clauza WHERE dinamic
    const whereConditions = [];

    // 1. Logica pentru "Incomplete"
    if (onlyIncomplete) {
      whereConditions.push({
        OR: [
          { cleanTitle: { equals: null } }, { cleanTitle: { equals: "" } },
          { propertyType: { equals: null } }, { propertyType: { equals: "" } },
          { transaction: { equals: null } },
          { rooms: { equals: null } },
          { summary: { equals: null } }, { summary: { equals: "" } },
          { priceEUR: { equals: null } },
          { city: { equals: null } }, { city: { equals: "" } },
          { image: { equals: null } }, { image: { equals: "" } },
        ],
      });
    }

    // 2. Logica pentru "Search" (Global Search)
    if (search) {
      whereConditions.push({
        OR: [
          { cleanTitle: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { zone: { contains: search, mode: 'insensitive' } },
          { Listing: { title: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

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

// --- CREATE ---
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

    const listing = await prisma.listing.create({
      data: {
        title: cleanTitle || "Fără titlu",
        description: summary || "",
        city: city || "",
        image: image || null,
        link: link || "",
        source: "OLX",
        transaction: transaction || "UNKNOWN",
        price: priceEUR ? Number(priceEUR) : null,
        currency: "EUR"
      }
    });

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

// --- UPDATE ---
adminRouter.put("/listings-ai/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const updated = await prisma.listingAI.update({
      where: { id },
      data: req.body, // Actualizăm direct cu ce primim (asigură-te că body-ul e curat în frontend)
    });

    return res.json({ item: updated });
  } catch (err) {
    console.error("ERROR PUT /admin/listings-ai/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- DELETE ---
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


// =========================================================
// --- SCRAPER MANAGEMENT (START / STOP / STATUS) ---
// =========================================================

// 1. START SCRAPER
adminRouter.post("/scraper/start", async (req, res) => {
  try {
    // Verificăm dacă rulează deja
    if (activeScraperProcess) {
      return res.status(400).json({ error: "Scraper is already running." });
    }

    const scriptPath = path.join(process.cwd(), "scraper/run_all.py");
    console.log("[SCRAPER] Starting script:", scriptPath);

    // Pornim procesul
    activeScraperProcess = spawn("python3", [scriptPath]);

    console.log(`[SCRAPER] Started with PID: ${activeScraperProcess.pid}`);

    // Ascultăm output-ul pentru debugging server-side
    activeScraperProcess.stdout.on("data", (data) => {
      console.log("[SCRAPER STDOUT]", data.toString().trim());
    });

    activeScraperProcess.stderr.on("data", (data) => {
      console.error("[SCRAPER STDERR]", data.toString().trim());
    });

    // Când se termină (singur sau cu eroare), curățăm variabila
    activeScraperProcess.on("close", (code) => {
      console.log(`[SCRAPER] Finished/Closed with code ${code}`);
      activeScraperProcess = null;
    });

    return res.json({ ok: true, message: "Scraper has started." });

  } catch (err) {
    console.error("[SCRAPER START ERROR]", err);
    activeScraperProcess = null;
    res.status(500).json({ error: "Could not start scraper." });
  }
});

// 2. STOP SCRAPER
adminRouter.post("/scraper/stop", async (req, res) => {
  try {
    if (!activeScraperProcess) {
      return res.json({ message: "No active process found to stop." });
    }

    // Trimitem semnal de kill (SIGTERM)
    console.log(`[SCRAPER] Killing process PID: ${activeScraperProcess.pid}`);
    activeScraperProcess.kill("SIGTERM"); 
    activeScraperProcess = null;

    // Actualizăm manual fișierul JSON ca frontend-ul să vadă imediat schimbarea
    const progressFile = path.join(process.cwd(), "scraper/progress.json");
    
    // Asigurăm că folderul există (just in case)
    const dir = path.dirname(progressFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stopState = {
      running: false,
      stage: "STOPPED",
      message: "Process stopped by user.",
      logs: ["[SYSTEM] Process killed manually via Admin Panel."],
      progress: 0,
      total: 0,
      current: 0,
      timestamp: Date.now() / 1000
    };
    
    fs.writeFileSync(progressFile, JSON.stringify(stopState));

    res.json({ success: true, message: "Scraper stopped successfully." });

  } catch (err) {
    console.error("[SCRAPER STOP ERROR]", err);
    res.status(500).json({ error: "Could not stop scraper." });
  }
});

// 3. GET STATUS
adminRouter.get("/scraper/status", (req, res) => {
  try {
    const file = path.join(process.cwd(), "scraper/progress.json");

    if (!fs.existsSync(file)) {
      return res.json({ running: false, stage: "IDLE", logs: [] });
    }

    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    
    // Siguranță: Dacă backend-ul s-a restartat, variabila activeScraperProcess e null,
    // dar JSON-ul ar putea zice încă "running: true". Corectăm asta doar vizual.
    if (!activeScraperProcess && data.running) {
        data.running = false;
        data.message = "Process disconnected (server restart).";
    }

    return res.json(data);

  } catch (err) {
    // Dacă citirea fișierului eșuează (e.g. scriere concurentă), returnăm un status neutru
    return res.json({ running: activeScraperProcess !== null });
  }
});

export default adminRouter;