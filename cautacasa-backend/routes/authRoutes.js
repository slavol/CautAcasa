import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyPhone } from "../controllers/phoneVerifyController.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-phone", verifyPhone);

export default router;