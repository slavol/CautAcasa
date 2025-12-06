import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyPhone } from "../controllers/phoneVerifyController.js";
import {authRequired} from "../middleware/authMiddleware.js"


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-phone", authRequired, verifyPhone);

export default router;