import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Use VITE_API_URL env var if set, otherwise fall back to local backend. We currently have no VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor — runs before every API call.
// Reads the accessToken from the Zustand store and attaches it as a Bearer token.
// If no token exists (user not logged in), the request goes out without the header.
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Tracks whether a refresh is already in progress to prevent multiple simultaneous refresh calls.
// All other 401'd requests queue up and wait for the single refresh to complete.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processRefreshQueue = (newToken: string) => {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
};

// Response interceptor — runs after every API response.
// Handles 401 Unauthorized by attempting a silent token refresh before failing.
api.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    // Only attempt refresh on 401 errors.
    // _retry flag prevents infinite loops if the refresh request itself returns 401.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request until it completes
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // Mark request as retried and start the refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken, setTokens } = useAuthStore.getState();

      // If we don't have a refresh token, there's no point calling the refresh
      // endpoint (the backend expects a token in the body and will return 400).
      // Immediately force a logout and redirect to the login page.
      if (!refreshToken) {
        refreshQueue = [];
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Call the refresh endpoint with the current refresh token
      const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Persist the new tokens in the store (and localStorage via persist middleware)
      setTokens(newAccessToken, newRefreshToken);

      // Unblock any requests that were waiting on the refresh
      processRefreshQueue(newAccessToken);

      // Retry the original failed request with the new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (err) {
      console.error('[api] refresh failed', err);
      // Refresh failed — session is invalid, force the user to log in again
      refreshQueue = [];
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(err || error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
