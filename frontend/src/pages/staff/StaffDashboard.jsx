import { useState, useEffect } from 'react'
import { getAllComplaints } from '../../api/complaintApi'
import ComplaintCard from '../../components/ComplaintCard'
import { useAuth } from '../../context/AuthContext'

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const { user } = useAuth()

  useEffect(() => {
    getAllComplaints(filters)
      .then((res) => setComplaints(res.data.complaints))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.department ? `Department: ${user.department}` : 'All departments'}</p>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          {['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'VERIFICATION', 'ESCALATED', 'RESOLVED', 'CLOSED'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priority</option>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No complaints found</div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}
    </div>
  )
}

export default StaffDashboard