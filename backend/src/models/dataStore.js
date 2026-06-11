import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../../data/store.json");

const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DEFAULT_STORE = {
  users: {}, refreshTokens: {}, players: {}, predictions: {}, matchResults: {}
};

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("⚠️  store.json corrupto, empezando de cero:", e.message);
  }
  return { ...DEFAULT_STORE };
}

let saveTimeout = null;
function saveStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2), "utf-8"); }
    catch (e) { console.error("❌ No se pudo guardar store.json:", e.message); }
  }, 200);
}

function makeReactive(obj) {
  return new Proxy(obj, {
    set(target, key, value) {
      target[key] = typeof value === "object" && value !== null ? makeReactive(value) : value;
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

// ─── FASE DE GRUPOS — 48 PARTIDOS OFICIALES FIFA 2026 ─────────────────────────
export const MATCHES = [
  // ── JORNADA 1 ──────────────────────────────────────────────────────────────
  // Grupo A
  { id: 1,  group: "A", teamA: "México",           teamB: "Sudáfrica",        date: "2026-06-11", time: "19:00", venue: "Ciudad de México" },
  { id: 2,  group: "A", teamA: "Corea del Sur",    teamB: "Rep. Checa",       date: "2026-06-11", time: "22:00", venue: "Guadalajara" },
  // Grupo B
  { id: 3,  group: "B", teamA: "Canadá",           teamB: "Bosnia-Herz.",     date: "2026-06-12", time: "19:00", venue: "Toronto" },
  { id: 4,  group: "D", teamA: "EE.UU.",           teamB: "Paraguay",         date: "2026-06-12", time: "22:00", venue: "Los Ángeles" },
  // Grupo B/C
  { id: 5,  group: "B", teamA: "Qatar",            teamB: "Suiza",            date: "2026-06-13", time: "16:00", venue: "San Francisco" },
  { id: 6,  group: "C", teamA: "Brasil",           teamB: "Marruecos",        date: "2026-06-13", time: "19:00", venue: "Nueva Jersey" },
  { id: 7,  group: "C", teamA: "Haití",            teamB: "Escocia",          date: "2026-06-13", time: "22:00", venue: "Boston" },
  { id: 8,  group: "D", teamA: "Australia",        teamB: "Turquía",          date: "2026-06-14", time: "01:00", venue: "Vancouver" },
  // Grupo E/F
  { id: 9,  group: "E", teamA: "Alemania",         teamB: "Curazao",          date: "2026-06-14", time: "14:00", venue: "Houston" },
  { id: 10, group: "F", teamA: "Países Bajos",     teamB: "Japón",            date: "2026-06-14", time: "17:00", venue: "Dallas" },
  { id: 11, group: "E", teamA: "Costa de Marfil",  teamB: "Ecuador",          date: "2026-06-14", time: "20:00", venue: "Philadelphia" },
  { id: 12, group: "F", teamA: "Suecia",           teamB: "Túnez",            date: "2026-06-14", time: "23:00", venue: "Monterrey" },
  // Grupo G/H
  { id: 13, group: "H", teamA: "España",           teamB: "Cabo Verde",       date: "2026-06-15", time: "13:00", venue: "Atlanta" },
  { id: 14, group: "G", teamA: "Bélgica",          teamB: "Egipto",           date: "2026-06-15", time: "16:00", venue: "Seattle" },
  { id: 15, group: "H", teamA: "Arabia Saudita",   teamB: "Uruguay",          date: "2026-06-15", time: "19:00", venue: "Miami" },
  { id: 16, group: "G", teamA: "Irán",             teamB: "Nueva Zelanda",    date: "2026-06-15", time: "22:00", venue: "Kansas City" },
  // Grupo I/J
  { id: 17, group: "I", teamA: "Francia",          teamB: "Senegal",          date: "2026-06-16", time: "14:00", venue: "Dallas" },
  { id: 18, group: "J", teamA: "Argentina",        teamB: "Argelia",          date: "2026-06-16", time: "17:00", venue: "Los Ángeles" },
  { id: 19, group: "I", teamA: "Irak",             teamB: "Noruega",          date: "2026-06-16", time: "20:00", venue: "Nueva York" },
  { id: 20, group: "J", teamA: "Austria",          teamB: "Jordania",         date: "2026-06-16", time: "23:00", venue: "Houston" },
  // Grupo K/L
  { id: 21, group: "K", teamA: "Portugal",         teamB: "Rep. Dem. Congo",  date: "2026-06-17", time: "14:00", venue: "Boston" },
  { id: 22, group: "L", teamA: "Inglaterra",       teamB: "Croacia",          date: "2026-06-17", time: "17:00", venue: "Nueva Jersey" },
  { id: 23, group: "K", teamA: "Ghana",            teamB: "Panamá",           date: "2026-06-17", time: "20:00", venue: "Atlanta" },
  { id: 24, group: "L", teamA: "Países Bajos B",   teamB: "Eslovenia",        date: "2026-06-17", time: "23:00", venue: "Miami" },

  // ── JORNADA 2 ──────────────────────────────────────────────────────────────
  { id: 25, group: "A", teamA: "México",           teamB: "Rep. Checa",       date: "2026-06-20", time: "14:00", venue: "Guadalajara" },
  { id: 26, group: "A", teamA: "Sudáfrica",        teamB: "Corea del Sur",    date: "2026-06-20", time: "17:00", venue: "Ciudad de México" },
  { id: 27, group: "B", teamA: "Canadá",           teamB: "Qatar",            date: "2026-06-20", time: "20:00", venue: "Vancouver" },
  { id: 28, group: "B", teamA: "Bosnia-Herz.",     teamB: "Suiza",            date: "2026-06-20", time: "23:00", venue: "Seattle" },
  { id: 29, group: "C", teamA: "Brasil",           teamB: "Escocia",          date: "2026-06-21", time: "14:00", venue: "Boston" },
  { id: 30, group: "C", teamA: "Marruecos",        teamB: "Haití",            date: "2026-06-21", time: "17:00", venue: "Nueva York" },
  { id: 31, group: "D", teamA: "EE.UU.",           teamB: "Turquía",          date: "2026-06-21", time: "20:00", venue: "Dallas" },
  { id: 32, group: "D", teamA: "Paraguay",         teamB: "Australia",        date: "2026-06-21", time: "23:00", venue: "Kansas City" },
  { id: 33, group: "E", teamA: "Alemania",         teamB: "Ecuador",          date: "2026-06-22", time: "14:00", venue: "Philadelphia" },
  { id: 34, group: "E", teamA: "Curazao",          teamB: "Costa de Marfil",  date: "2026-06-22", time: "17:00", venue: "Miami" },
  { id: 35, group: "F", teamA: "Países Bajos",     teamB: "Túnez",            date: "2026-06-22", time: "20:00", venue: "Atlanta" },
  { id: 36, group: "F", teamA: "Japón",            teamB: "Suecia",           date: "2026-06-22", time: "23:00", venue: "Houston" },
  { id: 37, group: "G", teamA: "Bélgica",          teamB: "Nueva Zelanda",    date: "2026-06-23", time: "14:00", venue: "Los Ángeles" },
  { id: 38, group: "G", teamA: "Egipto",           teamB: "Irán",             date: "2026-06-23", time: "17:00", venue: "San Francisco" },
  { id: 39, group: "H", teamA: "España",           teamB: "Uruguay",          date: "2026-06-23", time: "20:00", venue: "Nueva York" },
  { id: 40, group: "H", teamA: "Arabia Saudita",   teamB: "Cabo Verde",       date: "2026-06-23", time: "23:00", venue: "Dallas" },
  { id: 41, group: "I", teamA: "Francia",          teamB: "Noruega",          date: "2026-06-24", time: "14:00", venue: "Seattle" },
  { id: 42, group: "I", teamA: "Senegal",          teamB: "Irak",             date: "2026-06-24", time: "17:00", venue: "Kansas City" },
  { id: 43, group: "J", teamA: "Argentina",        teamB: "Austria",          date: "2026-06-24", time: "20:00", venue: "Houston" },
  { id: 44, group: "J", teamA: "Argelia",          teamB: "Jordania",         date: "2026-06-24", time: "23:00", venue: "Atlanta" },
  { id: 45, group: "K", teamA: "Portugal",         teamB: "Panamá",           date: "2026-06-25", time: "14:00", venue: "Miami" },
  { id: 46, group: "K", teamA: "Rep. Dem. Congo",  teamB: "Ghana",            date: "2026-06-25", time: "17:00", venue: "Philadelphia" },
  { id: 47, group: "L", teamA: "Inglaterra",       teamB: "Eslovenia",        date: "2026-06-25", time: "20:00", venue: "Los Ángeles" },
  { id: 48, group: "L", teamA: "Croacia",          teamB: "Países Bajos B",   date: "2026-06-25", time: "23:00", venue: "Boston" },

  // ── JORNADA 3 (simultáneos por grupo) ──────────────────────────────────────
  { id: 49, group: "A", teamA: "México",           teamB: "Corea del Sur",    date: "2026-06-26", time: "20:00", venue: "Ciudad de México" },
  { id: 50, group: "A", teamA: "Rep. Checa",       teamB: "Sudáfrica",        date: "2026-06-26", time: "20:00", venue: "Guadalajara" },
  { id: 51, group: "B", teamA: "Canadá",           teamB: "Suiza",            date: "2026-06-26", time: "00:00", venue: "Toronto" },
  { id: 52, group: "B", teamA: "Bosnia-Herz.",     teamB: "Qatar",            date: "2026-06-26", time: "00:00", venue: "Vancouver" },
  { id: 53, group: "C", teamA: "Brasil",           teamB: "Haití",            date: "2026-06-27", time: "20:00", venue: "Nueva Jersey" },
  { id: 54, group: "C", teamA: "Escocia",          teamB: "Marruecos",        date: "2026-06-27", time: "20:00", venue: "Boston" },
  { id: 55, group: "D", teamA: "EE.UU.",           teamB: "Australia",        date: "2026-06-27", time: "00:00", venue: "Seattle" },
  { id: 56, group: "D", teamA: "Turquía",          teamB: "Paraguay",         date: "2026-06-27", time: "00:00", venue: "Kansas City" },
  { id: 57, group: "E", teamA: "Alemania",         teamB: "Costa de Marfil",  date: "2026-06-27", time: "20:00", venue: "Philadelphia" },
  { id: 58, group: "E", teamA: "Ecuador",          teamB: "Curazao",          date: "2026-06-27", time: "20:00", venue: "Houston" },
  { id: 59, group: "F", teamA: "Países Bajos",     teamB: "Suecia",           date: "2026-06-27", time: "00:00", venue: "Dallas" },
  { id: 60, group: "F", teamA: "Túnez",            teamB: "Japón",            date: "2026-06-27", time: "00:00", venue: "Monterrey" },
  { id: 61, group: "G", teamA: "Bélgica",          teamB: "Irán",             date: "2026-06-27", time: "20:00", venue: "Los Ángeles" },
  { id: 62, group: "G", teamA: "Nueva Zelanda",    teamB: "Egipto",           date: "2026-06-27", time: "20:00", venue: "San Francisco" },
  { id: 63, group: "H", teamA: "España",           teamB: "Arabia Saudita",   date: "2026-06-27", time: "00:00", venue: "Miami" },
  { id: 64, group: "H", teamA: "Uruguay",          teamB: "Cabo Verde",       date: "2026-06-27", time: "00:00", venue: "Atlanta" },
  { id: 65, group: "I", teamA: "Francia",          teamB: "Irak",             date: "2026-06-27", time: "20:00", venue: "Dallas" },
  { id: 66, group: "I", teamA: "Noruega",          teamB: "Senegal",          date: "2026-06-27", time: "20:00", venue: "Nueva York" },
  { id: 67, group: "J", teamA: "Argentina",        teamB: "Jordania",         date: "2026-06-27", time: "00:00", venue: "Houston" },
  { id: 68, group: "J", teamA: "Argelia",          teamB: "Austria",          date: "2026-06-27", time: "00:00", venue: "Kansas City" },
  { id: 69, group: "K", teamA: "Portugal",         teamB: "Ghana",            date: "2026-06-27", time: "20:00", venue: "Boston" },
  { id: 70, group: "K", teamA: "Panamá",           teamB: "Rep. Dem. Congo",  date: "2026-06-27", time: "20:00", venue: "Atlanta" },
  { id: 71, group: "L", teamA: "Inglaterra",       teamB: "Países Bajos B",   date: "2026-06-27", time: "00:00", venue: "Nueva Jersey" },
  { id: 72, group: "L", teamA: "Eslovenia",        teamB: "Croacia",          date: "2026-06-27", time: "00:00", venue: "Philadelphia" },
];

// ─── Sistema de puntuación ────────────────────────────────────────────────────
export const calculateScore = (playerPrediction, matchResult) => {
  if (!matchResult || !playerPrediction) return 0;

  if (playerPrediction.mode === "winner") {
    return playerPrediction.winner === matchResult.winner ? 3 : 0;
  }

  if (playerPrediction.mode === "score") {
    const { homeScore, awayScore } = playerPrediction;
    const { homeScore: rH, awayScore: rA } = matchResult;
    if (homeScore === rH && awayScore === rA) return 5;
    if (
      (homeScore > awayScore && rH > rA) ||
      (homeScore < awayScore && rH < rA) ||
      (homeScore === awayScore && rH === rA)
    ) return 2;
    return 0;
  }

  return 0;
};
