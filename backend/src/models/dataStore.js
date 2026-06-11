import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../../data/store.json");

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default empty store
const DEFAULT_STORE = {
  users: {},
  refreshTokens: {},
  players: {},
  predictions: {},
  matchResults: {}
};

// Load from disk or start fresh
function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("⚠️  Could not read store.json, starting fresh:", e.message);
  }
  return { ...DEFAULT_STORE };
}

// Save to disk (debounced to avoid hammering the filesystem)
let saveTimeout = null;
function saveStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2), "utf-8");
    } catch (e) {
      console.error("❌ Could not save store.json:", e.message);
    }
  }, 200);
}

// Proxy: intercept writes and auto-save
function makeReactive(obj) {
  return new Proxy(obj, {
    set(target, key, value) {
      target[key] = typeof value === "object" && value !== null
        ? makeReactive(value)
        : value;
      saveStore();
      return true;
    },
    deleteProperty(target, key) {
      delete target[key];
      saveStore();
      return true;
    }
  });
}

export const dataStore = makeReactive(loadStore());

// ─── Match list ───────────────────────────────────────────────────────────────
export const MATCHES = [
  // Grupo A
  { id: 1,  group: "A", teamA: "México",    teamB: "Polonia",    date: "2026-06-11" },
  { id: 2,  group: "A", teamA: "Arabia S.", teamB: "Argentina",  date: "2026-06-11" },
  { id: 3,  group: "B", teamA: "Francia",   teamB: "Australia",  date: "2026-06-12" },
  { id: 4,  group: "B", teamA: "Dinamarca", teamB: "Túnez",      date: "2026-06-12" },
  { id: 5,  group: "C", teamA: "España",    teamB: "Costa Rica", date: "2026-06-13" },
  { id: 6,  group: "C", teamA: "Alemania",  teamB: "Japón",      date: "2026-06-13" },
  { id: 7,  group: "D", teamA: "Brasil",    teamB: "Serbia",     date: "2026-06-14" },
  { id: 8,  group: "D", teamA: "Suiza",     teamB: "Camerún",    date: "2026-06-14" },
  { id: 9,  group: "E", teamA: "Portugal",  teamB: "Ghana",      date: "2026-06-15" },
  { id: 10, group: "E", teamA: "Uruguay",   teamB: "Corea Sur",  date: "2026-06-15" },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────
export const calculateScore = (playerPrediction, matchResult) => {
  if (!matchResult || !playerPrediction) return 0;

  if (playerPrediction.mode === "winner") {
    return playerPrediction.winner === matchResult.winner ? 3 : 0;
  }

  if (playerPrediction.mode === "score") {
    const { homeScore, awayScore } = playerPrediction;
    const { homeScore: rH, awayScore: rA } = matchResult;

    if (homeScore === rH && awayScore === rA) return 5; // marcador exacto
    if (
      (homeScore > awayScore && rH > rA) ||
      (homeScore < awayScore && rH < rA) ||
      (homeScore === awayScore && rH === rA)
    ) return 2; // tendencia correcta
    return 0;
  }

  return 0;
};
