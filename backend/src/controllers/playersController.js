import { dataStore } from "../models/dataStore.js";

export const createPlayer = (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!dataStore.players[userId]) {
      const player = {
        id: userId,
        name: name || req.user.name,
        email: email || req.user.email,
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dataStore.players[userId] = player;
      return res.status(201).json(player);
    }

    res.status(409).json({ error: "Player already exists" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlayers = (req, res) => {
  try {
    const players = Object.values(dataStore.players);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlayerById = (req, res) => {
  try {
    const { id } = req.params;
    const player = dataStore.players[id];

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentPlayer = (req, res) => {
  try {
    const userId = req.user.id;
    const player = dataStore.players[userId];

    if (!player) {
      return res.status(404).json({ error: "Player profile not found" });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlayer = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Users can only update their own profile
    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!dataStore.players[id]) {
      return res.status(404).json({ error: "Player not found" });
    }

    const { name } = req.body;
    if (name) dataStore.players[id].name = name;
    dataStore.players[id].updatedAt = new Date().toISOString();

    res.json(dataStore.players[id]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePlayer = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Users can only delete their own profile
    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!dataStore.players[id]) {
      return res.status(404).json({ error: "Player not found" });
    }

    delete dataStore.players[id];
    delete dataStore.predictions[id];

    res.json({ message: "Player deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

