import express from "express";
import { getMatches, saveMatchResult, getMatchResult } from "../controllers/resultsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /matches → público, cualquiera puede ver los partidos
router.get("/", getMatches);
router.get("/:matchId/result", getMatchResult);

// POST /matches/:matchId/result → protegido (solo admin/autenticados)
router.post("/:matchId/result", authMiddleware, saveMatchResult);

export default router;
