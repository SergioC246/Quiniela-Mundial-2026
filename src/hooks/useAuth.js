import { useState } from "react";

const AUTH_TOKEN_KEY = "mundial_2026_auth_token";
const USER_KEY = "mundial_2026_user";

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, apiService) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.login(email, password);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.message || "Login failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, apiService) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.register(name, email, password);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.message || "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  return {
    token,
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };
};
