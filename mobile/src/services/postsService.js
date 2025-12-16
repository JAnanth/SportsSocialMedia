import apiClient from '../config/api';

export const postsService = {
  async getFeed(params = {}) {
    const response = await apiClient.get('/posts', { params });
    return response.data.posts;
  },

  async getPostById(id) {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(postData) {
    const response = await apiClient.post('/posts', postData);
    return response.data.post;
  },

  async votePost(postId, voteType) {
    const response = await apiClient.post(`/posts/${postId}/vote`, { voteType });
    return response.data;
  },

  async deletePost(postId) {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },
};
