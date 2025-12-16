import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure your API base URL
// For local development on physical device, use your computer's IP address
// For Android emulator: http://10.0.2.2:3000
// For iOS simulator: http://localhost:3000
const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
