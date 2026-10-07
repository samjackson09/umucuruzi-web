import api from "../lib/api";

export const orderService = {
  // Customer
  getCustomerOrders: () => api.get("/orders").then((r) => r.data),
  createOrder: (data) => api.post("/orders", data).then((r) => r.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  trackOrder: (id) => api.get(`/orders/${id}/track`).then((r) => r.data),
  confirmDelivery: (id) => api.put(`/orders/${id}/confirm`).then((r) => r.data),
  validatePromoCode: (code) =>
    api
      .post("/orders/validate-promo", { code: code.trim().toUpperCase() })
      .then((r) => r.data),

  // Trader
  getTraderOrders: () => api.get("/trader/orders").then((r) => r.data),
  updateOrderStatus: (id, status) =>
    api.put(`/trader/orders/${id}/status`, { status }).then((r) => r.data),
  assignAgent: (orderId, agentId) =>
    api
      .post(`/trader/orders/${orderId}/assign-agent`, { agent_id: agentId })
      .then((r) => r.data),
};