export const storageService = {
  async get(key) {
    if (window.storage && typeof window.storage.get === "function") {
      try {
        const val = await window.storage.get(key, true);
        if (val !== undefined && val !== null) return val;
      } catch (error) {
        console.warn("Storage shared get failed", error);
      }
      try {
        const val = await window.storage.get(key, { shared: true });
        if (val !== undefined && val !== null) return val;
      } catch (error) {
        console.warn("Storage shared fallback get failed", error);
      }
    }
    return localStorage.getItem(key);
  },

  async set(key, value) {
    if (window.storage && typeof window.storage.set === "function") {
      try {
        await window.storage.set(key, value, true);
        return "shared";
      } catch (error) {
        console.warn("Storage shared set failed", error);
      }
      try {
        await window.storage.set(key, value, { shared: true });
        return "shared";
      } catch (error) {
        console.warn("Storage shared fallback set failed", error);
      }
    }
    localStorage.setItem(key, value);
    return "local";
  }
};
