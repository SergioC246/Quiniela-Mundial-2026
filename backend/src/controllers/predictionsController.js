import { dataStore } from "../models/dataStore.js";

export const savePredictions = (req, res) => {
  try {
    const { playerId } = req.params;
    const { predictions } = req.body;

    if (!dataStore.players[playerId]) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (!predictions || typeof predictions !== "object") {
      return res.status(400).json({ error: "Invalid predictions format" });
    }

    dataStore.predictions[playerId] = {
      playerId,
      predictions,
      savedAt: new Date().toISOString()
    };

    res.status(201).json(dataStore.predictions[playerId]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPredictions = (req, res) => {
  try {
    const { playerId } = req.params;

    if (!dataStore.players[playerId]) {
      return res.status(404).json({ error: "Player not found" });
    }

    const prediction = dataStore.predictions[playerId] || { playerId, predictions: {} };

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
