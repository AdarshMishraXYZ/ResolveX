import { useNavigate } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { MapPin, Clock, Building2, ArrowRight } from 'lucide-react'

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate()
  const isOverdue = complaint.dueAt && new Date(complaint.dueAt) < new Date() &&
    !['RESOLVED', 'CLOSED'].includes(complaint.status)

  return (
    <div
      onClick={() => navigate(`/complaints/${complaint.id}`)}
      className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all group ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-3">
          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition">{complaint.title}</h3>
          {isOverdue && (
            <span className="text-xs text-red-600 font-medium">⚠ SLA Breached</span>
          )}
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">{complaint.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <PriorityBadge priority={complaint.priority} />
          {complaint.department && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
              <Building2 size={10} />
              {complaint.department.name}
            </span>
          )}
          {complaint.location && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={10} />
              {complaint.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={10} />
            {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
          </span>
          <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition" />
        </div>
      </div>
    </div>
  )
}

export default ComplaintCard