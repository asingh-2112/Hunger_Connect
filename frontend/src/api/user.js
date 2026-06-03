import axiosClient from './axiosClient';

export const userApi = {
  getMe: () => axiosClient.get('/api/users/me').then((r) => r.data),

  updateMe: (data) => axiosClient.put('/api/users/me', data).then((r) => r.data),

  getById: (id) => axiosClient.get(`/api/users/${id}`).then((r) => r.data),

  getAll: ({ page = 0, size = 20 } = {}) =>
    axiosClient.get('/api/users', { params: { page, size } }).then((r) => r.data),

  setActive: (id, active) =>
    axiosClient.patch(`/api/users/${id}/active`, null, { params: { active } }).then((r) => r.data),
};
