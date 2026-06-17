import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants'

export const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
    {status?.replace('_', ' ')}
  </span>
)

export const PriorityBadge = ({ priority }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800'}`}>
    {priority}
  </span>
)