import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/api/auth/register', data).then((r) => r.data),
  login: (data) => axiosClient.post('/api/auth/login', data).then((r) => r.data),
  refresh: (refreshToken) => axiosClient.post('/api/auth/refresh', { refreshToken }).then((r) => r.data),
  forgotPassword: (email) => axiosClient.post('/api/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, newPassword) => axiosClient.post('/api/auth/reset-password', { token, newPassword }).then((r) => r.data),
  logout: (refreshToken) => axiosClient.post('/api/auth/logout', { refreshToken }).then((r) => r.data),
};
