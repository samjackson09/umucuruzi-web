import api from "../lib/api";
export const cartService = {
  addToCart: (data: { product_id: number; quantity: number }) =>
    api.post("/cart", data).then((r) => r.data),
  getCart: () => api.get("/cart").then((r) => r.data),
  updateCartItem: (id: number, quantity: number) =>
    api.put(`/cart/${id}`, { quantity }).then((r) => r.data),
  removeFromCart: (id: number) => api.delete(`/cart/${id}`).then((r) => r.data),
  clearCart: () => api.delete("/cart").then((r) => r.data),
};