import express from "express";
import { authRequired, adminRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start-scraper", authRequired, adminRequired, (req, res) => {
  res.json({ message: "Scraper started!" });
});

export default router;