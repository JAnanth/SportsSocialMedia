import apiClient from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  },

  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getStoredToken() {
    return await AsyncStorage.getItem('authToken');
  },
};
