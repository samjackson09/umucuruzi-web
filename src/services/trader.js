import api from "../lib/api";

export const traderService = {
  getTraders: (params) =>
    api.get("/users/traders", { params }).then((r) => r.data),
  getTraderById: (id) =>
    api.get(`/users/traders/${id}`).then((r) => r.data),
  getBusinessCategories: () =>
    api.get("/trader/business-categories").then((r) => r.data),
  getTraderProfile: () =>
    api.get("/trader/profile").then((r) => r.data),
  getDashboardStats: () =>
    api.get("/trader/dashboard").then((r) => r.data),
};