import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { dataStore } from "../models/dataStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "mundial2026-jwt-secret-cambiar-en-prod";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "mundial2026-refresh-secret-cambiar-en-prod";
const ACCESS_TOKEN_EXPIRY = "2h";     // 15m era demasiado corto para desarrollo
const REFRESH_TOKEN_EXPIRY = "7d";

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name, type: "access" },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { id: user.id, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
}

// Auto-crea el perfil de jugador si no existe (evita el paso manual)
function ensurePlayerProfile(user) {
  if (!dataStore.players[user.id]) {
    dataStore.players[user.id] = {
      id: user.id,
      name: user.name,
      email: user.email,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const emailLower = email.toLowerCase().trim();

    if (dataStore.users[emailLower]) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: emailLower,
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    dataStore.users[emailLower] = user;
    ensurePlayerProfile(user);   // ← crea el perfil automáticamente

    const { accessToken, refreshToken } = generateTokens(user);
    dataStore.refreshTokens[emailLower] = refreshToken;

    console.log(`✅ Nuevo usuario registrado: ${user.name} (${user.email})`);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const emailLower = email.toLowerCase().trim();
    const user = dataStore.users[emailLower];

    if (!user) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    ensurePlayerProfile(user);   // ← por si el jugador no tiene perfil todavía

    const { accessToken, refreshToken } = generateTokens(user);
    dataStore.refreshTokens[emailLower] = refreshToken;

    console.log(`🔑 Login: ${user.name} (${user.email})`);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const refresh = (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token requerido" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const userId = decoded.id;

    if (dataStore.refreshTokens[userId] !== refreshToken) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    const user = dataStore.users[userId];
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    dataStore.refreshTokens[userId] = newRefreshToken;

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch {
    res.status(401).json({ error: "Refresh token inválido o expirado" });
  }
};

export const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No se proporcionó token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

export const logout = (req, res) => {
  try {
    const userId = req.user.id;
    delete dataStore.refreshTokens[userId];
    res.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
