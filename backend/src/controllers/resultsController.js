import { dataStore, MATCHES } from "../models/dataStore.js";

export const getMatches = (req, res) => {
  try {
    const matchesWithResults = MATCHES.map(match => ({
      ...match,
      result: dataStore.matchResults[match.id] || null
    }));

    res.json(matchesWithResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveMatchResult = (req, res) => {
  try {
    const { matchId } = req.params;
    const { homeScore, awayScore, winner } = req.body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: "matchId, homeScore, and awayScore are required" });
    }

    const match = MATCHES.find(m => m.id === parseInt(matchId));
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const result = {
      matchId: parseInt(matchId),
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      winner: winner || (homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw"),
      savedAt: new Date().toISOString()
    };

    dataStore.matchResults[matchId] = result;

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMatchResult = (req, res) => {
  try {
    const { matchId } = req.params;

    const match = MATCHES.find(m => m.id === parseInt(matchId));
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const result = dataStore.matchResults[matchId] || null;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
