import express from "express";
import { createPlayer, getPlayers, getPlayerById, getCurrentPlayer, updatePlayer, deletePlayer } from "../controllers/playersController.js";

const router = express.Router();

router.post("/", createPlayer);
router.get("/", getPlayers);
router.get("/me", getCurrentPlayer);
router.get("/:id", getPlayerById);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;
