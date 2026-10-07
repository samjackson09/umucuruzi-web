import api from "../lib/api";

export const referralService = {
  getMyReferrals: () => api.get("/referrals/me").then((r) => r.data),
  validateCode: (code) =>
    api.get(`/referrals/validate/${code}`).then((r) => r.data),
};