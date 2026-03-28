import api from './api';

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const charityService = {
  list: (params) => api.get('/charities', { params }),
  featured: () => api.get('/charities/featured'),
  detail: (slug) => api.get(`/charities/${slug}`),
  create: (payload) => api.post('/charities', payload),
  update: (id, payload) => api.put(`/charities/${id}`, payload),
  remove: (id) => api.delete(`/charities/${id}`)
};

export const subscriptionService = {
  status: () => api.get('/subscriptions/status'),
  create: (payload) => api.post('/subscriptions', payload),
  createCheckoutSession: (payload) => api.post('/subscriptions/checkout-session', payload),
  confirmCheckoutSession: (sessionId) => api.post('/subscriptions/confirm-session', { sessionId }),
  cancel: () => api.post('/subscriptions/cancel'),
  donate: (payload) => api.post('/subscriptions/donations', payload)
};

export const userService = {
  dashboard: () => api.get('/dashboard'),
  updatePreferences: (payload) => api.patch('/profile/preferences', payload),
  scores: () => api.get('/scores'),
  addScore: (payload) => api.post('/scores', payload),
  updateScore: (scoreId, payload) => api.put(`/scores/${scoreId}`, payload),
  draws: () => api.get('/draws'),
  prizes: () => api.get('/prizes'),
  uploadProof: (prizeId, formData) => api.post(`/prizes/${prizeId}/proof`, formData)
};

export const adminService = {
  analytics: () => api.get('/admin/analytics'),
  users: () => api.get('/admin/users'),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  previewDraw: (payload) => api.post('/draws/preview', payload),
  publishDraw: (payload) => api.post('/draws/publish', payload),
  proofs: () => api.get('/admin/proofs'),
  reviewProof: (id, payload) => api.put(`/admin/proofs/${id}`, payload)
};

