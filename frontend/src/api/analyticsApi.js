import api from './authApi'

export const getOverview = () => api.get('/analytics/overview')