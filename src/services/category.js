import api from "../lib/api";

export const categoryService = {
  getCategories: () => api.get("/categories").then((r) => r.data),
};