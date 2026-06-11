import express from "express";
import { savePredictions, getPredictions } from "../controllers/predictionsController.js";

const router = express.Router();

router.post("/:playerId/predictions", savePredictions);
router.get("/:playerId/predictions", getPredictions);

export default router;
