import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

// === NEW ROUTES IMPORTS ===
import searchRouter from "./routes/searchRoutes.js";
import favoritesRouter from "./routes/favoriteRoutes.js";
import historyRouter from "./routes/historyRoutes.js";
import recommendedRouter from "./routes/recommandationRoutes.js";
import listingsRouter from "./routes/listingsRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// === AUTH EXISTENT ===
app.use("/api/auth", authRoutes);

// === NEW FEATURE ROUTES ===
app.use("/api/search", searchRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/history", historyRouter);
app.use("/api/recommended", recommendedRouter);
app.use("/api/listings", listingsRouter);

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));