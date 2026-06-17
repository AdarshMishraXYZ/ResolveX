import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyComplaints } from '../../api/complaintApi'
import ComplaintCard from '../../components/ComplaintCard'
import { useAuth } from '../../context/AuthContext'
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react'

const Dashboard = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getMyComplaints()
      .then((res) => setComplaints(res.data.complaints))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter)

  const counts = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'SUBMITTED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name} 👋</p>
        </div>
        <button
          onClick={() => navigate('/complaints/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm shadow-lg shadow-blue-200"
        >
          <Plus size={16} />
          New Complaint
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total, icon: FileText, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Open', value: counts.open, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Progress', value: counts.inProgress, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Resolved', value: counts.resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg font-medium mb-2">No complaints found</p>
          <p className="text-gray-400 text-sm mb-6">Submit your first complaint and we'll route it automatically</p>
          <button
            onClick={() => navigate('/complaints/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Submit Complaint
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c) => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}
    </div>
  )
}

export default Dashboard