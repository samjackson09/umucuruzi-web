import api from "../lib/api";

export const marketService = {
  getMarkets: () => api.get("/markets").then((r) => r.data),
  getMarketById: (id) => api.get(`/markets/${id}`).then((r) => r.data),
  getNearbyMarkets: (lat, lng, radius = 50) =>
    api
      .get("/markets/nearby", { params: { lat, lng, radius } })
      .then((r) => r.data),
};