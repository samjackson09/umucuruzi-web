import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  init: () => void;
}

const apply = (t: Theme) => {
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem("theme", t);
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  init: () => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const t: Theme = stored ?? (prefersDark ? "dark" : "light");
    apply(t);
    set({ theme: t });
  },
  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    apply(next);
    set({ theme: next });
  },
}));