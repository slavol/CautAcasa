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

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minute

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


    // TODO: Replace with real SMSO.ro integration
    console.log("OTP pentru verificare (temporar):", otp);

    res.status(201).json({
      message: "Cont creat. Introdu codul OTP trimis pe telefon.",
      userId: user.id
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare server." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Utilizator inexistent." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Parolă greșită." });

    if (!user.phoneVerified) {
      return res.status(403).json({ message: "Numărul de telefon nu este validat." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Autentificat cu succes.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare server.", error });
  }
};