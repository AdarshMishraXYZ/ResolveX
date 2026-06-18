import axios from 'axios'
import { API_URL } from '../utils/constants'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const getDepartments = () => api.get('/departments')
export const getPendingStaff = () => api.get('/auth/pending-staff')
export const approveStaff = (id) => api.patch('/auth/approve-staff/' + id)

export default api