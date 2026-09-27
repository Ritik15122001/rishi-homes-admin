import { create } from "zustand";

const STORAGE_KEY = "rhi_admin_auth";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, admin: null };
  } catch {
    return { token: null, admin: null };
  }
}

export const useAuthStore = create((set) => ({
  ...load(),
  login: (token, admin) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, admin }));
    set({ token, admin });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, admin: null });
  }
}));
