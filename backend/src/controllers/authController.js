import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { dataStore } from "../models/dataStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "tu-clave-secreta-super-segura-cambiar-en-produccion";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "tu-refresh-secreto-cambiar-en-produccion";
const ACCESS_TOKEN_EXPIRY = "15m";
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

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const emailLower = email.toLowerCase();
    if (dataStore.users[emailLower]) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: emailLower,
      name,
      email: emailLower,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    dataStore.users[emailLower] = user;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    dataStore.refreshTokens[emailLower] = refreshToken;

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailLower = email.toLowerCase();
    const user = dataStore.users[emailLower];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    dataStore.refreshTokens[emailLower] = refreshToken;

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refresh = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const userId = decoded.id;

    // Check if refresh token is valid (stored)
    if (dataStore.refreshTokens[userId] !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = dataStore.users[userId];
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update stored refresh token
    dataStore.refreshTokens[userId] = newRefreshToken;

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const logout = (req, res) => {
  try {
    const userId = req.user.id;
    // Remove refresh token
    delete dataStore.refreshTokens[userId];
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
