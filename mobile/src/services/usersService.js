import apiClient from '../config/api';

export const usersService = {
  async getUserProfile(userId) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data.user;
  },

  async updateProfile(userData) {
    const response = await apiClient.put('/users/me', userData);
    return response.data.user;
  },

  async getUserPosts(userId, params = {}) {
    const response = await apiClient.get(`/users/${userId}/posts`, { params });
    return response.data.posts;
  },

  async followUser(userId) {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data;
  },

  async unfollowUser(userId) {
    const response = await apiClient.delete(`/users/${userId}/follow`);
    return response.data;
  },

  async searchUsers(query) {
    const response = await apiClient.get('/users/search', { params: { q: query } });
    return response.data.users;
  },

  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response.data.notifications;
  },

  async markNotificationAsRead(notificationId) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.unreadCount;
  },
};
