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

    // Pentru testare: dacă phone începe cu "test", folosește OTP fix "123456"
    const otp = phone.startsWith("test") ? "123456" : generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minute

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


    // TODO: Replace with real SMS.ro integration
    // Only show OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`
╔════════════════════════════════════════════╗
║  OTP PENTRU VERIFICARE (TEMPORAR)         ║
║  Telefon: ${phone.padEnd(30)}║
║  Cod OTP: ${otp.padEnd(30)}║
║  Expiră în 30 minute                      ║
╚════════════════════════════════════════════╝
      `);
    }

    res.status(201).json({
      message: "Cont creat. Introdu codul OTP trimis pe telefon.",
      userId: user.id,
      // Pentru testing, returnăm OTP-ul în response (DOAR DEVELOPMENT!)
      ...(process.env.NODE_ENV === 'development' && phone.startsWith("test") && { otpForTesting: otp })
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare server." });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Utilizator inexistent." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Parolă greșită." });
    }

    // NU mai blocăm dacă telefonul nu e verificat
    // doar reținem informația
    const token = jwt.sign(
      { id: user.id, role: user.role, phoneVerified: user.phoneVerified },
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
        role: user.role,
        phoneVerified: user.phoneVerified, 
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Eroare server." });
  }
};