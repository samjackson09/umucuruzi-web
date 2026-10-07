import api from "../lib/api";

export const productService = {
  getProducts: (params) =>
    api.get("/products", { params }).then((r) => r.data),
  getProductById: (id) =>
    api.get(`/products/${id}`).then((r) => r.data),
  getProductsByTrader: (traderId) =>
    api.get(`/products/trader/${traderId}`).then((r) => r.data),
  searchProducts: (q) =>
    api.get("/products", { params: { search: q } }).then((r) => r.data),
  getTraderProducts: () =>
    api.get("/trader/products").then((r) => r.data),
  createProduct: (data) =>
    api
      .post("/trader/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  updateProduct: (id, data) =>
    api
      .put(`/trader/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  deleteProduct: (id) =>
    api.delete(`/trader/products/${id}`).then((r) => r.data),
};