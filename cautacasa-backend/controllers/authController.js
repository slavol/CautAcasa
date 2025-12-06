// src/controllers/authcontroller.js
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email deja folosit." });
    }

    const hash = await bcrypt.hash(password, 10);

    // OTP pentru test
    const otp = phone.startsWith("test") ? "123456" : generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hash,
        phoneVerified: false,
        phoneOTP: otp,
        otpExpiresAt: expiresAt
      }
    });

    // GENERARE TOKEN LA REGISTER ❗
    const token = jwt.sign(
      { id: user.id, role: user.role, phoneVerified: false },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Logăm OTP doar în development
    if (process.env.NODE_ENV === "development") {
      console.log(`
====== OTP DEV ======
Telefon: ${phone}
OTP: ${otp}
=====================
      `);
    }

    res.status(201).json({
      message: "Cont creat. Introdu codul OTP.",
      token, // ➜ TOKEN trimis la frontend
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: false
      },
      ...(process.env.NODE_ENV === "development" &&
        phone.startsWith("test") && { otpForTesting: otp })
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Eroare server." });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Utilizator inexistent." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Parolă greșită." });

    const token = jwt.sign(
      { id: user.id, role: user.role, phoneVerified: user.phoneVerified },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Autentificat.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Eroare server." });
  }
};