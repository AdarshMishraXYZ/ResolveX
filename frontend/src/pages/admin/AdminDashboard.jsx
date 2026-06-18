import { useState, useEffect } from 'react'
import { getOverview } from '../../api/analyticsApi'
import { getAllComplaints } from '../../api/complaintApi'
import { getPendingStaff, approveStaff } from '../../api/authApi'
import ComplaintCard from '../../components/ComplaintCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, XCircle, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const StatCard = ({ label, value, color, bg, icon: Icon, trend }) => (
  <div className={`${bg} rounded-2xl p-6 flex items-between justify-between`}>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      {trend && <p className="text-xs text-gray-400 mt-2">{trend}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} border border-gray-100 shadow-sm`}>
      <Icon size={22} className={color} />
    </div>
  </div>
)

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [pendingStaff, setPendingStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [approving, setApproving] = useState(null)

  const loadPending = () => {
    getPendingStaff().then((res) => setPendingStaff(res.data.pending)).catch(() => {})
  }

  useEffect(() => {
    Promise.all([getOverview(), getAllComplaints({ limit: 6 })])
      .then(([ovRes, compRes]) => {
        setOverview(ovRes.data)
        setComplaints(compRes.data.complaints)
      })
      .finally(() => setLoading(false))
    loadPending()
  }, [])

  const handleApprove = async (id) => {
    setApproving(id)
    try {
      await approveStaff(id)
      toast.success('Staff account approved')
      setPendingStaff((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    } finally {
      setApproving(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  const categoryData = overview?.byCategory?.map((c) => ({
    name: c.category,
    count: c._count.id,
  })) || []

  const pieData = [
    { name: 'Open', value: overview?.open || 0 },
    { name: 'In Progress', value: overview?.inProgress || 0 },
    { name: 'Resolved', value: overview?.resolved || 0 },
    { name: 'Closed', value: overview?.closed || 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">ResolveX — Smart Complaint Management</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total" value={overview?.total || 0} color="text-gray-800" bg="bg-white border border-gray-100 shadow-sm" icon={FileText} trend="All time" />
        <StatCard label="Open" value={overview?.open || 0} color="text-blue-600" bg="bg-blue-50" icon={Clock} trend="Needs attention" />
        <StatCard label="In Progress" value={overview?.inProgress || 0} color="text-orange-500" bg="bg-orange-50" icon={TrendingUp} trend="Being worked on" />
        <StatCard label="Resolved" value={overview?.resolved || 0} color="text-green-600" bg="bg-green-50" icon={CheckCircle} trend="Awaiting close" />
        <StatCard label="Closed" value={overview?.closed || 0} color="text-gray-500" bg="bg-gray-50" icon={XCircle} trend="Completed" />
        <StatCard label="SLA Breached" value={overview?.slaBreached || 0} color="text-red-600" bg="bg-red-50" icon={AlertTriangle} trend="Needs escalation" />
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['overview', 'complaints', 'staff'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition -mb-px flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'staff' ? 'Pending staff' : tab}
            {tab === 'staff' && pendingStaff.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingStaff.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {categoryData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-700 mb-6">Complaints by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {pieData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-700 mb-6">Status Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>
          )}

          {overview?.slaBreached > 0 && (
            <div className="lg:col-span-2 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">{overview.slaBreached} complaint{overview.slaBreached > 1 ? 's' : ''} have breached SLA deadline</p>
                <p className="text-red-600 text-sm mt-0.5">These need immediate attention and escalation.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="grid gap-4">
          {complaints.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No complaints yet</div>
          ) : (
            complaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="grid gap-4">
          {pendingStaff.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <UserCheck size={36} className="mx-auto mb-3 text-gray-300" />
              No pending staff accounts
            </div>
          ) : (
            pendingStaff.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                  <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {p.department?.name}
                  </span>
                </div>
                <button
                  onClick={() => handleApprove(p.id)}
                  disabled={approving === p.id}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {approving === p.id ? 'Approving...' : 'Approve'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
