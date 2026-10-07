import api from "../lib/api";
export const notificationService = {
  getMyNotifications: () => api.get("/notifications").then((r) => r.data),
  getUnreadCount: () =>
    api.get("/notifications/unread-count").then((r) => r.data?.count || 0),
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put("/notifications/read-all").then((r) => r.data),
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
  clearAll: () => api.delete("/notifications").then((r) => r.data),
};