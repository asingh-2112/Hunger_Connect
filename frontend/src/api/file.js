import axiosClient from './axiosClient';

export const fileApi = {
  upload: (file, folder = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return axiosClient.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
