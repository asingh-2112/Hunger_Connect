import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every request
axiosClient.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Handle 401: try refresh token, then retry original request once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        clearStoredTokens();
        window.location.href = '/adminlogin';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });
        storeTokens(data);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearStoredTokens();
        window.location.href = '/adminlogin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem('hc_tokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeTokens = (authResponse) => {
  localStorage.setItem('hc_tokens', JSON.stringify({
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
  }));
  localStorage.setItem('hc_user', JSON.stringify({
    id: authResponse.userId,
    email: authResponse.email,
    name: authResponse.name,
    role: authResponse.role,
  }));
};

export const clearStoredTokens = () => {
  localStorage.removeItem('hc_tokens');
  localStorage.removeItem('hc_user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('hc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default axiosClient;
