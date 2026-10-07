import api from "../lib/api";

export const reviewService = {
  // Generic (product or trader)
  getReviews: (targetType, targetId) =>
    api
      .get(`/reviews?target_type=${targetType}&target_id=${targetId}`)
      .then((r) => r.data),

  createReview: (payload) =>
    api.post("/reviews", payload).then((r) => r.data),

  // Trader reviews
  getTraderReviews: (traderId) =>
    api.get(`/reviews/trader/${traderId}`).then((r) => r.data),

  createTraderReview: (traderId, payload) =>
    api.post(`/reviews/trader/${traderId}`, payload).then((r) => r.data),

  deleteTraderReview: (id) =>
    api.delete(`/reviews/trader/${id}`).then((r) => r.data),
};