import axios from 'axios';
import { ENV } from '../config/env';

/**
 * Centralized Gateway Axios HTTP Client.
 * Auto-injects X-Correlation-Id UUID & Bearer tokens.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const client = axios.create({
  baseURL: ENV.API_GATEWAY_URL,
  timeout: ENV.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach X-Correlation-Id & Bearer Token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Attach user identity header for dev mode / gateway testing
  const userId = localStorage.getItem('user_id') || '1';
  config.headers['X-User-Id'] = userId;
  
  // Inject Correlation ID
  config.headers['X-Correlation-Id'] = `corr_${crypto.randomUUID()}`;
  return config;
});

// Response Interceptor: Catch 401 Unauthorized for silent token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('[API Client] Unauthorized request detected. Attempting token refresh...');
      // Silent refresh logic or redirect to login
    }
    return Promise.reject(error);
  }
);
