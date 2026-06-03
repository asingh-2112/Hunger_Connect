import axiosClient from './axiosClient';

export const donationApi = {
  create: (data) => axiosClient.post('/api/donations', data).then((r) => r.data),

  getById: (id) => axiosClient.get(`/api/donations/${id}`).then((r) => r.data),

  getPending: ({ city, page = 0, size = 20 } = {}) =>
    axiosClient.get('/api/donations', { params: { city, page, size } }).then((r) => r.data),

  getMy: ({ page = 0, size = 20 } = {}) =>
    axiosClient.get('/api/donations/my', { params: { page, size } }).then((r) => r.data),

  getAccepted: ({ page = 0, size = 20 } = {}) =>
    axiosClient.get('/api/donations/accepted', { params: { page, size } }).then((r) => r.data),

  accept: (id) => axiosClient.post(`/api/donations/${id}/accept`).then((r) => r.data),

  withdraw: (id) => axiosClient.post(`/api/donations/${id}/withdraw`).then((r) => r.data),

  complete: (id) => axiosClient.post(`/api/donations/${id}/complete`).then((r) => r.data),

  delete: (id) => axiosClient.delete(`/api/donations/${id}`).then((r) => r.data),

  rate: (data) => axiosClient.post('/api/donations/rate', data).then((r) => r.data),
};
