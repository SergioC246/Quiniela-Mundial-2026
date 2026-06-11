import { dataStore, calculateScore } from "../models/dataStore.js";

export const getLeaderboard = (req, res) => {
  try {
    const leaderboard = Object.values(dataStore.players).map(player => {
      const playerPredictions = dataStore.predictions[player.id]?.predictions || {};
      let totalScore = 0;

      Object.keys(playerPredictions).forEach(matchId => {
        const prediction = playerPredictions[matchId];
        const result = dataStore.matchResults[matchId];
        totalScore += calculateScore(prediction, result);
      });

      return {
        id: player.id,
        name: player.name,
        email: player.email,
        score: totalScore,
        joinedAt: player.joinedAt
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
