import { create } from "zustand";
import { authService } from "../services/auth";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  init: () => {
    try {
      const token = localStorage.getItem("token");
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      set({ token, user });
    } catch {
      set({ token: null, user: null });
    }
  },
  login: async (username, password) => {
    const data = await authService.login(username, password);
    set({ token: data.token, user: data.user });
    return data;
  },
  signup: async (payload) => {
    const data = await authService.signup(payload);
    set({ token: data.token, user: data.user });
    return data;
  },
  logout: () => {
    authService.logout();
    set({ token: null, user: null });
  },
}));