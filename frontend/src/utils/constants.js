export const API_URL = 'http://localhost:5000/api'

export const ROLES = {
  CITIZEN: 'CITIZEN',
  STAFF: 'STAFF',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  ADMIN: 'ADMIN',
}

export const STATUS_COLORS = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  VERIFICATION: 'bg-cyan-100 text-cyan-800',
  ESCALATED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-200 text-red-900',
  REOPENED: 'bg-pink-100 text-pink-800',
}

export const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
}

export const CATEGORIES = [
  'Network', 'Electrical', 'Water', 'Hostel', 'Sanitation',
  'Administration', 'Maintenance', 'IT', 'Other',
]