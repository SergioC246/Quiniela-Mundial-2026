import express from "express";
import { register, login, refresh, verifyToken, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/verify", verifyToken);
router.post("/logout", authMiddleware, logout);

export default router;
