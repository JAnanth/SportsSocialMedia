import apiClient from '../config/api';

export const teamsService = {
  async getAllTeams(params = {}) {
    const response = await apiClient.get('/teams', { params });
    return response.data.teams;
  },

  async getTeamById(id) {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data.team;
  },

  async addFavoriteTeam(teamId, fandomLevel, ranking) {
    const response = await apiClient.post('/teams/favorites', {
      teamId,
      fandomLevel,
      ranking,
    });
    return response.data;
  },

  async removeFavoriteTeam(teamId) {
    const response = await apiClient.delete(`/teams/favorites/${teamId}`);
    return response.data;
  },

  async getUserFavoriteTeams() {
    const response = await apiClient.get('/teams/favorites/me');
    return response.data.teams;
  },
};
