import api from "../lib/api";

export const promoService = {
  getMyPromoCodes: () => api.get("/promo/my").then((r) => r.data),
  createPromoCode: (data) => api.post("/promo", data).then((r) => r.data),
  deletePromoCode: (id) => api.delete(`/promo/${id}`).then((r) => r.data),
  togglePromoCode: (id) => api.patch(`/promo/${id}/toggle`).then((r) => r.data),
  sendToLoyalCustomers: (id) =>
    api.post(`/promo/${id}/send-to-loyal`).then((r) => r.data),
};