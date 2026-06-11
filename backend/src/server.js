import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import playersRouter from "./routes/players.js";
import predictionsRouter from "./routes/predictions.js";
import matchesRouter from "./routes/matches.js";
import leaderboardRouter from "./routes/leaderboard.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend de Quiniela funcionando 🚀" });
});

// Public routes
app.use("/auth", authRouter);

// Protected routes
app.use("/players", authMiddleware, playersRouter);
app.use("/players", authMiddleware, predictionsRouter);
app.use("/matches", authMiddleware, matchesRouter);
app.use("/leaderboard", leaderboardRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});