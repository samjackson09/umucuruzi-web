// src/services/user.js
import api from "../lib/api";

export const userService = {
  getProfile: () => api.get("/users/me").then((r) => r.data),
  updateProfile: (data) => api.put("/users/me", data).then((r) => r.data),
};