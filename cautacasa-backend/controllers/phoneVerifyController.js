import prisma from "../config/prisma.js";

export const verifyPhone = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(400).json({ message: "Utilizator inexistent." });

    if (user.phoneVerified)
      return res.status(400).json({ message: "Telefon deja verificat." });

    if (user.phoneOTP !== otp)
      return res.status(400).json({ message: "Cod OTP invalid." });

    if (new Date() > user.otpExpiresAt)
      return res.status(400).json({ message: "Cod OTP expirat." });

    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneOTP: null,
        otpExpiresAt: null
      }
    });

    res.json({ message: "Telefon verificat cu succes." });
  } catch (error) {
    console.error("Verify phone error:", error);
    res.status(500).json({ message: "Eroare server." });
  }
};