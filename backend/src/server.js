import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import playersRouter from "./routes/players.js";
import predictionsRouter from "./routes/predictions.js";
import matchesRouter from "./routes/matches.js";
import leaderboardRouter from "./routes/leaderboard.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));
app.use(express.json());

// ─── Public routes ────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Backend Quiniela Mundial 2026 🚀" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/auth", authRouter);
app.use("/leaderboard", leaderboardRouter);    // público: cualquiera puede ver la tabla
app.use("/matches", matchesRouter);            // público: ver partidos sin token

// ─── Protected routes ─────────────────────────────────────────────────────────
app.use("/players", authMiddleware, playersRouter);
app.use("/players", authMiddleware, predictionsRouter);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Datos persistidos en backend/data/store.json\n`);
});
