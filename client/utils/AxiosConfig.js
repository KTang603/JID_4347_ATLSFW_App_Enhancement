import axios from 'axios';
import { getAuthToken } from './TokenUtils';
import { store } from '../redux/store';

/**
 * Configures global axios settings and interceptors
 */
export const configureAxios = () => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      try {
        // Get the current Redux state
        const state = store.getState();
        const reduxToken = state.token?.token;
        
        // Get token using our utility function
        const token = await getAuthToken(reduxToken);
        
        // If token exists, add it to the request headers
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      } catch (error) {
        console.error('Error in axios request interceptor:', error);
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 errors globally
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized request detected in global interceptor');
        // You could dispatch a logout action here or show a global notification
        // But be careful not to create infinite loops with navigation
      }
      return Promise.reject(error);
    }
  );
};