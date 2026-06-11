// In-memory data store (replace with database later)
export const dataStore = {
  users: {},
  refreshTokens: {},
  players: {},
  predictions: {},
  matchResults: {}
};

// Matches constants (from frontend)
export const MATCHES = [
  { id: 1, teamA: "España", teamB: "Brasil", date: "2026-06-15" },
  { id: 2, teamA: "Argentina", teamB: "Francia", date: "2026-06-16" }
];

export const calculateScore = (playerPrediction, matchResult) => {
  if (!matchResult) return 0;

  if (playerPrediction.mode === "winner") {
    if (playerPrediction.winner === matchResult.winner) return 3;
    return 0;
  }

  if (playerPrediction.mode === "score") {
    const { homeScore, awayScore } = playerPrediction;
    const { homeScore: resultHome, awayScore: resultAway } = matchResult;

    if (homeScore === resultHome && awayScore === resultAway) return 5;
    if ((homeScore > awayScore && resultHome > resultAway) ||
        (homeScore < awayScore && resultHome < resultAway) ||
        (homeScore === awayScore && resultHome === resultAway)) return 2;
    return 0;
  }

  return 0;
};

