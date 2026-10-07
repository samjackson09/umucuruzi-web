import api from "../lib/api";

export const searchService = {
  searchAll: (query, limit) =>
    api
      .get("/search", { params: { q: query, limit: limit || 20 } })
      .then((r) => r.data),

  searchTradersByLocation: (location, category = "", sort = "rating") =>
    api
      .get("/search/traders-by-location", {
        params: { location, category, sort },
      })
      .then((r) => r.data),
};