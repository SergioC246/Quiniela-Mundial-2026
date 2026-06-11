import express from "express";
import { getMatches, saveMatchResult, getMatchResult } from "../controllers/resultsController.js";

const router = express.Router();

router.get("/", getMatches);
router.post("/:matchId/result", saveMatchResult);
router.get("/:matchId/result", getMatchResult);

export default router;
