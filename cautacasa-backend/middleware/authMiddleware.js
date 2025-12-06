import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: "No token provided." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "Invalid token." });

    req.user = user; // atașăm userul în request
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized." });
  }
};

export const adminRequired = async (req, res, next) => {
  try {
    if (!req.user) {        
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied — admins only." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};