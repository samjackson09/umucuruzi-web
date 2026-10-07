import api from "../lib/api";

export const loyaltyService = {
  getTrustedTraders: () =>
    api.get("/loyalty/customer/trusted-traders").then((r) => r.data),
  getCustomerDeliveryAgents: () =>
    api.get("/loyalty/customer/delivery-agents").then((r) => r.data),

  getLoyalCustomers: () =>
    api.get("/loyalty/trader/loyal-customers").then((r) => r.data),
  getTraderDeliveryAgents: () =>
    api.get("/loyalty/trader/delivery-agents").then((r) => r.data),

  getAgentDeliveryHistory: () =>
    api.get("/loyalty/agent/delivery-history").then((r) => r.data),
};