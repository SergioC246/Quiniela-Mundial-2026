const API_URL = "http://localhost:3001";

export const apiService = {
  // Auth
  async register(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error registering");
    }
    return await res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error logging in");
    }
    return await res.json();
  },

  async refresh(refreshToken) {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error refreshing token");
    }
    return await res.json();
  },

  async logout(token) {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error logging out");
    return await res.json();
  },

  async verifyToken(token) {
    const res = await fetch(`${API_URL}/auth/verify`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Token invalid");
    return await res.json();
  },

  // Players
  async createPlayer(name, email, token) {
    const res = await fetch(`${API_URL}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) throw new Error("Error creating player");
    return await res.json();
  },

  async getCurrentPlayer(token) {
    const res = await fetch(`${API_URL}/players/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetching player");
    return await res.json();
  },

  async getPlayers(token) {
    const res = await fetch(`${API_URL}/players`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetching players");
    return await res.json();
  },

  async getPlayerById(id, token) {
    const res = await fetch(`${API_URL}/players/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetching player");
    return await res.json();
  },

  async updatePlayer(id, name, token) {
    const res = await fetch(`${API_URL}/players/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error("Error updating player");
    return await res.json();
  },

  async deletePlayer(id, token) {
    const res = await fetch(`${API_URL}/players/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error deleting player");
    return await res.json();
  },

  // Predictions
  async savePredictions(playerId, predictions, token) {
    const res = await fetch(`${API_URL}/players/${playerId}/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ predictions })
    });
    if (!res.ok) throw new Error("Error saving predictions");
    return await res.json();
  },

  async getPredictions(playerId, token) {
    const res = await fetch(`${API_URL}/players/${playerId}/predictions`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetching predictions");
    return await res.json();
  },

  // Matches & Results
  async getMatches(token) {
    const res = await fetch(`${API_URL}/matches`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetching matches");
    return await res.json();
  },

  async saveMatchResult(matchId, homeScore, awayScore, winner, token) {
    const res = await fetch(`${API_URL}/matches/${matchId}/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ homeScore, awayScore, winner })
    });
    if (!res.ok) throw new Error("Error saving match result");
    return await res.json();
  },

  async getMatchResult(matchId, token) {
    const res = await fetch(`${API_URL}/matches/${matchId}/result`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetching match result");
    return await res.json();
  },

  // Leaderboard
  async getLeaderboard() {
    const res = await fetch(`${API_URL}/leaderboard`);
    if (!res.ok) throw new Error("Error fetching leaderboard");
    return await res.json();
  }
};