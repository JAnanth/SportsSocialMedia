import apiClient from '../config/api';

export const gameThreadsService = {
  async getGameThreads(params = {}) {
    const response = await apiClient.get('/game-threads', { params });
    return response.data.gameThreads;
  },

  async getGameThreadById(id) {
    const response = await apiClient.get(`/game-threads/${id}`);
    return response.data.gameThread;
  },

  async createGameThreadPost(gameThreadId, content, postPhase = 'live') {
    const response = await apiClient.post('/game-threads/posts', {
      gameThreadId,
      content,
      postPhase,
    });
    return response.data.post;
  },

  async getGameThreadPosts(gameThreadId, params = {}) {
    const response = await apiClient.get(`/game-threads/${gameThreadId}/posts`, { params });
    return response.data.posts;
  },
};
