import axios from "axios";

const api = axios.create({
  baseURL: "https://app-f57c4746-3838-4314-8c7e-de2713c61ef2.cleverapps.io/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // 🔴 Only redirect on 401 with a token present — otherwise ignore
    const hasToken = !!localStorage.getItem("token");
    if (error?.response?.status === 401 && hasToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
