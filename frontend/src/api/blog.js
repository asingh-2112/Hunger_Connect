import axiosClient from './axiosClient';

export const blogApi = {
  create: (data) => axiosClient.post('/api/blogs', data).then((r) => r.data),

  getAll: ({ page = 0, size = 20 } = {}) =>
    axiosClient.get('/api/blogs', { params: { page, size } }).then((r) => r.data),

  getMy: ({ page = 0, size = 20 } = {}) =>
    axiosClient.get('/api/blogs/my', { params: { page, size } }).then((r) => r.data),

  getById: (id) => axiosClient.get(`/api/blogs/${id}`).then((r) => r.data),

  delete: (id) => axiosClient.delete(`/api/blogs/${id}`).then((r) => r.data),

  toggleLike: (id) => axiosClient.post(`/api/blogs/${id}/like`).then((r) => r.data),

  getComments: (blogId, { page = 0, size = 20 } = {}) =>
    axiosClient.get(`/api/blogs/${blogId}/comments`, { params: { page, size } }).then((r) => r.data),

  addComment: (blogId, text) =>
    axiosClient.post(`/api/blogs/${blogId}/comments`, { text }).then((r) => r.data),

  deleteComment: (commentId) =>
    axiosClient.delete(`/api/blogs/comments/${commentId}`).then((r) => r.data),
};
