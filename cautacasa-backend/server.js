import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import listingsRouter from "./routes/listingsRoutes.js";

import aiRouter from "./routes/aiRoutes.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// === AUTH EXISTENT ===
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRouter)

app.use("/api/ai", aiRouter);
app.use("/api/chat", chatRouter);

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));