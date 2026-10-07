import api from "../lib/api";

export const priceTableService = {
  getPriceTable: () => api.get("/trader/pricetable").then((r) => r.data),
  addPriceTableItem: (data) =>
    api.post("/trader/pricetable", data).then((r) => r.data),
  updatePriceTableItem: (id, data) =>
    api.put(`/trader/pricetable/${id}`, data).then((r) => r.data),
  deletePriceTableItem: (id) =>
    api.delete(`/trader/pricetable/${id}`).then((r) => r.data),
};