import { create } from "zustand";
import api from "../lib/api";

export const useCartStore = create((set, get) => ({
  cart: [],
  loading: false,

  totalItems: () =>
    get().cart.reduce(
      (sum, g) =>
        sum + (g.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
      0
    ),

  totalAmount: () =>
    get().cart.reduce(
      (sum, g) =>
        sum +
        (g.items || []).reduce(
          (s, i) => s + (Number(i.quantity) || 0) * (Number(i.Product?.price) || 0),
          0
        ),
      0
    ),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const data = await api.get("/cart").then((r) => r.data);
      set({ cart: data || [] });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    await api.post("/cart", { product_id: productId, quantity });
    await get().fetchCart();
  },

  updateQuantity: async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await get().fetchCart();
  },

  removeFromCart: async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await get().fetchCart();
  },

  clearCart: async () => {
    await api.delete("/cart");
    set({ cart: [] });
  },
}));