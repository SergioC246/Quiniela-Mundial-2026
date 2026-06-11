import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend de Quiniela funcionando 🚀" });
});

app.get("/matches", (req, res) => {
  res.json([
    { id: 1, teamA: "España", teamB: "Brasil", date: "2026-06-15" },
    { id: 2, teamA: "Argentina", teamB: "Francia", date: "2026-06-16" }
  ]);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});