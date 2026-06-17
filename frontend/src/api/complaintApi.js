import api from './authApi'

export const createComplaint = (data) => api.post('/complaints', data)
export const getMyComplaints = () => api.get('/complaints/my')
export const getAllComplaints = (params) => api.get('/complaints', { params })
export const getComplaintById = (id) => api.get(`/complaints/${id}`)
export const updateStatus = (id, status, version) => api.patch(`/complaints/${id}/status`, { status, version })
export const addComment = (id, comment) => api.post(`/complaints/${id}/comments`, { comment })
export const assignComplaint = (id, assignedTo) => api.post(`/complaints/${id}/assign`, { assignedTo })
export const getNotifications = () => api.get('/notifications')
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`)