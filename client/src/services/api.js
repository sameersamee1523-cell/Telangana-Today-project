import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.patch('/auth/update-password', data),
}

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getReporters: () => api.get('/users/reporters'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export const storiesAPI = {
  getAll: (params) => api.get('/stories', { params }),
  getKanban: () => api.get('/stories/kanban'),
  getById: (id) => api.get(`/stories/${id}`),
  create: (data) => api.post('/stories', data),
  update: (id, data) => api.put(`/stories/${id}`, data),
  updateStatus: (id, data) => api.patch(`/stories/${id}/status`, data),
  delete: (id) => api.delete(`/stories/${id}`),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const analyticsAPI = {
  getDashboardStats: async () => {
    const res = await api.get('/analytics/dashboard-stats')
    const d = res.data || {}
    return {
      totalStories: d.storyStats?.total_stories || 0,
      activeReporters: d.active_reporters || 0,
      pendingStories: d.storyStats?.pending_review || 0,
      publishedStories: d.storyStats?.published || 0,
      recentStories: d.recentActivity || [],
      overdueStories: d.overdueStories || []
    }
  },
  getReporterPerformance: () => api.get('/analytics/reporter-performance'),
  getCompletionRate: () => api.get('/analytics/completion-rate'),
  getDeadlineCompliance: () => api.get('/analytics/deadline-compliance'),
  getCategoryWise: () => api.get('/analytics/category-wise'),
  getMonthlyProductivity: () => api.get('/analytics/monthly-productivity'),
}

export const reportsAPI = {
  generate: (data) => api.post('/reports/generate', data),
  getAll: () => api.get('/reports'),
  export: (id, format) => api.get(`/reports/${id}/export/${format}`, { responseType: 'blob' }),
}

export const adminAPI = {
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
}

export default api
