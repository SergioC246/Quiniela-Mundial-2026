const API_URL = "http://localhost:3001";

export const apiService = {
  async getMatches() {
    const res = await fetch(`${API_URL}/matches`);
    if (!res.ok) throw new Error("Error fetching matches");
    return await res.json();
  }
};