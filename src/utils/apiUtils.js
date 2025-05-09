import axios from 'axios';
import { getCookie, setCookie, removeCookie, isTokenValid } from './cookieUtils';
import { cognitoConfig } from '../config/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  async (config) => {
    // Get the access token from cookies
    const token = getCookie('access_token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (expired tokens)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = getCookie('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Use Cognito token endpoint to refresh tokens
        const tokenEndpoint = `https://${cognitoConfig.DOMAIN}/oauth2/token`;
        const tokenData = new URLSearchParams();
        tokenData.append('grant_type', 'refresh_token');
        tokenData.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
        tokenData.append('refresh_token', refreshToken);
        
        const refreshResponse = await axios.post(tokenEndpoint, tokenData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        const accessToken = refreshResponse.data.access_token;
        const idToken = refreshResponse.data.id_token;
        
        // Store the new tokens
        const cookieOptions = {
          path: cognitoConfig.COOKIE_PATH,
          secure: cognitoConfig.COOKIE_SECURE,
          sameSite: 'strict',
          domain: cognitoConfig.COOKIE_DOMAIN,
          maxAge: cognitoConfig.ACCESS_TOKEN_EXPIRY
        };
        
        setCookie('access_token', accessToken, cookieOptions);
        setCookie('id_token', idToken, cookieOptions);
        
        // Update the authorization header and retry the request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        removeCookie('access_token');
        removeCookie('id_token');
        removeCookie('refresh_token');
        
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API request functions
export const getTasks = () => api.get('/tasks');
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;