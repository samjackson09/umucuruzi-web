import api from "../lib/api";

export const advertisementService = {
  getActiveAds: () => api.get("/ads").then((r) => r.data),
};