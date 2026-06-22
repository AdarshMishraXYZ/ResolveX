import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getComplaintById, addComment, updateStatus, uploadAttachment, getAttachments } from '../../api/complaintApi'
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import {
  CheckCircle, Clock, AlertTriangle, MessageSquare,
  Building2, MapPin, User, Send, ChevronRight,
  Shield, XCircle, ArrowUpCircle, ThumbsUp
} from 'lucide-react'

const WORKFLOW_STEPS = [
  { status: 'SUBMITTED', label: 'Submitted', desc: 'Complaint received by system', icon: CheckCircle, color: 'blue' },
  { status: 'UNDER_REVIEW', label: 'Under Review', desc: 'Department reviewing your complaint', icon: Clock, color: 'blue' },
  { status: 'ASSIGNED', label: 'Assigned', desc: 'Assigned to a staff member', icon: User, color: 'blue' },
  { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Staff is actively working on it', icon: ArrowUpCircle, color: 'blue' },
  { status: 'VERIFICATION', label: 'Verification', desc: 'Solution being verified', icon: Shield, color: 'blue' },
  { status: 'RESOLVED', label: 'Resolved', desc: 'Issue has been resolved', icon: ThumbsUp, color: 'green' },
  { status: 'CLOSED', label: 'Closed', desc: 'Complaint closed successfully', icon: CheckCircle, color: 'gray' },
]


const getAvailableTransitions = (role, complaint) => {
  const status = complaint.status
  const priority = complaint.priority

  if (role === 'STAFF') {
    if (status === 'SUBMITTED') return ['UNDER_REVIEW']
    if (status === 'ASSIGNED') return ['IN_PROGRESS']
    if (status === 'IN_PROGRESS') {
      return (priority === 'LOW' || priority === 'MEDIUM')
        ? ['VERIFICATION', 'RESOLVED']
        : ['VERIFICATION']
    }
    return []
  }

  if (role === 'DEPARTMENT_HEAD') {
    if (status === 'UNDER_REVIEW') return ['ASSIGNED', 'REJECTED']
    if (status === 'IN_PROGRESS') return ['ESCALATED']
    if (status === 'VERIFICATION') return ['RESOLVED', 'REOPENED']
    return []
  }

  if (role === 'ADMIN') {
    if (status === 'RESOLVED') return ['CLOSED', 'REOPENED']
    if (status === 'ESCALATED') return ['RESOLVED', 'IN_PROGRESS']
    return []
  }

  return []
}

const ACTION_LABELS = {
  UNDER_REVIEW: { label: 'Start Review', color: 'blue' },
  ASSIGNED: { label: 'Assign to Staff', color: 'blue' },
  IN_PROGRESS: { label: 'Mark In Progress', color: 'blue' },
  VERIFICATION: { label: 'Send for Verification', color: 'blue' },
  RESOLVED: { label: 'Mark Resolved', color: 'green' },
  CLOSED: { label: 'Close Complaint', color: 'gray' },
  ESCALATED: { label: 'Escalate to Admin', color: 'orange' },
  REJECTED: { label: 'Reject Complaint', color: 'red' },
  REOPENED: { label: 'Reopen Complaint', color: 'orange' },

}

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.status === currentStatus)
  const isRejected = currentStatus === 'REJECTED'
  const isEscalated = currentStatus === 'ESCALATED'
  const isReopened = currentStatus === 'REOPENED'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Clock size={16} className="text-blue-600" />
        Complaint Progress
      </h2>

      {isRejected && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-700 text-sm font-semibold">Complaint Rejected</p>
            <p className="text-red-500 text-xs mt-0.5">This complaint was reviewed and rejected by the department.</p>
          </div>
        </div>
      )}

      {isEscalated && (
        <div>
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
            <AlertTriangle size={20} className="text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-orange-700 text-sm font-semibold">Complaint Escalated</p>
              <p className="text-orange-500 text-xs mt-0.5">Sent to higher authority for urgent resolution. Admin is now handling this.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-500 border-2 border-orange-500 ring-4 ring-orange-100 flex-shrink-0">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <div className="pt-1.5">
              <p className="text-sm font-semibold text-orange-600">
                Escalated
                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Current</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Admin will take action on this complaint</p>
            </div>
          </div>
        </div>
      )}

      {isReopened && (
        <div className="flex items-center gap-3 bg-pink-50 border border-pink-200 rounded-xl p-4 mb-5">
          <ArrowUpCircle size={20} className="text-pink-600 flex-shrink-0" />
          <div>
            <p className="text-pink-700 text-sm font-semibold">Complaint Reopened</p>
            <p className="text-pink-500 text-xs mt-0.5">This complaint has been reopened for further review.</p>
          </div>
        </div>
      )}

      {!isRejected && !isEscalated && (
        <div className="relative">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex
            const Icon = step.icon

            return (
              <div key={step.status} className="flex items-start gap-4 mb-4 last:mb-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent && step.color === 'green'
                      ? 'bg-green-500 border-green-500 ring-4 ring-green-100 scale-110'
                      : isCurrent
                      ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100 scale-110'
                      : isCompleted
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-200'
                  }`}>
                    {isCompleted
                      ? <Icon size={15} className="text-white" />
                      : <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    }
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 transition-all ${
                      index < currentIndex ? 'bg-blue-600' : 'bg-gray-100'
                    }`} />
                  )}
                </div>

                <div className={`pt-1.5 ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-75' : 'opacity-35'
                }`}>
                  <p className={`text-sm font-semibold ${
                    isCurrent && step.color === 'green'
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                    {isCurrent && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        step.color === 'green'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const AttachmentSection = ({ complaintId }) => {
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getAttachments(complaintId).then(res => setAttachments(res.data.attachments)).catch(() => {})
  }, [complaintId])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAttachment(complaintId, file)
      setAttachments(prev => [...prev, res.data.attachment])
      toast.success("File uploaded")
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-800 mb-4">Attachments</h2>
      {attachments.length === 0 ? (
        <p className="text-gray-300 text-sm mb-4">No attachments yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {attachments.map(a => (
            <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition truncate">
              {a.fileType.startsWith("image") ? "🖼" : "📄"} {a.s3Key.split("-").slice(1).join("-")}
            </a>
          ))}
        </div>
      )}
      <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">
        {uploading ? "Uploading..." : "+ Attach file"}
        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}
          accept="image/jpeg,image/png,image/webp,application/pdf" />
      </label>
    </div>
  )
}

const ComplaintDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchComplaint = () => {
    getComplaintById(id)
      .then((res) => setComplaint(res.data.complaint))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchComplaint() }, [id])

  useEffect(() => {
    if (socket) {
      socket.on('statusUpdate', ({ complaintId, status }) => {
        if (complaintId === id) {
          fetchComplaint()
          toast.success(`Status updated to ${status.replace(/_/g, ' ')}`)
        }
      })
    }
  }, [socket, id])

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      await addComment(id, comment)
      toast.success('Message sent')
      setComment('')
      fetchComplaint()
    } catch {
      toast.error('Failed to send message')
    }
  }
const handleStatusUpdate = async (newStatus) => {
  setUpdating(newStatus)
  try {
    await updateStatus(id, newStatus, complaint.version)
    toast.success(`Moved to ${newStatus.replace(/_/g, ' ')}`)
    fetchComplaint()
  } catch (err) {
    if (err.response?.status === 409) {
      toast.error('Someone else just updated this. Refreshing...')
      fetchComplaint()
    } else {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  } finally {
    setUpdating(null)
  }
}
  

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  if (!complaint) return (
    <div className="text-center py-32 text-gray-400">Complaint not found</div>
  )

  const availableTransitions = complaint && user ? getAvailableTransitions(user.role, complaint) : []
  const isOverdue = complaint.dueAt && new Date(complaint.dueAt) < new Date() &&
    !['RESOLVED', 'CLOSED'].includes(complaint.status)

  const getButtonStyle = (status) => {
    const color = ACTION_LABELS[status]?.color || 'blue'
    const styles = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      orange: 'bg-orange-500 hover:bg-orange-600 text-white',
      red: 'bg-red-500 hover:bg-red-600 text-white',
      gray: 'bg-gray-600 hover:bg-gray-700 text-white',
    }
    return styles[color] || styles.blue
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-sm mb-6 transition"
      >
        ← Back
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-4">
            <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
            <p className="text-xs text-gray-400 mt-1">
              Submitted by{' '}
              <span className="font-medium text-gray-600">{complaint.createdBy?.name}</span>
              {' · '}
              {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5 bg-gray-50 rounded-xl p-4">
          {complaint.description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Category</span>
            <span className="font-medium text-gray-700">{complaint.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Priority</span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 size={13} className="text-gray-400" />
            <span className="font-medium text-gray-700 text-xs">{complaint.department?.name || 'Unassigned'}</span>
          </div>
          {complaint.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-gray-400" />
              <span className="font-medium text-gray-700 text-xs">{complaint.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 col-span-2">
            <Clock size={13} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              SLA Deadline: {complaint.dueAt ? new Date(complaint.dueAt).toLocaleString() : 'N/A'}
              {isOverdue && ' — ⚠ OVERDUE'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {availableTransitions.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Available Actions</p>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating === status}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 ${getButtonStyle(status)}`}
                >
                  <ChevronRight size={14} />
                  {updating === status ? 'Updating...' : ACTION_LABELS[status]?.label || status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <StatusTimeline currentStatus={complaint.status} />

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-600" />
          Messages & Updates
          {complaint.comments?.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">
              {complaint.comments.length}
            </span>
          )}
        </h2>

        {complaint.comments?.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <MessageSquare size={28} className="mx-auto mb-2" />
            <p className="text-sm">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-5">
            {complaint.comments?.map((c) => {
              const isOwn = c.userId === user?.id
              const roleName = c.user?.role?.name || ''
              const isStaff = ['STAFF', 'DEPARTMENT_HEAD', 'ADMIN'].includes(roleName)

              return (
                <div key={c.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 ${
                      isStaff ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : isStaff
                        ? 'bg-green-50 border border-green-100 text-gray-800 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${
                          isOwn ? 'text-blue-200' : isStaff ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {c.user?.name}
                          {isStaff && !isOwn && (
                            <span className="ml-1.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                              {roleName}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{c.comment}</p>
                      <p className={`text-xs mt-1.5 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isOwn && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0 mt-1">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <form onSubmit={handleComment} className="flex gap-3 border-t border-gray-100 pt-4">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder={
              user?.role === 'CITIZEN'
                ? 'Add more details or ask a question...'
                : `Reply as ${user?.role?.toLowerCase()}...`
            }
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Send size={14} />
            Send
          </button>
        </form>
      </div>

      {/* Attachments */}
      <AttachmentSection complaintId={id} />

      {/* Activity Log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-5">Activity Log</h2>
        {complaint.auditLogs?.length === 0 ? (
          <p className="text-gray-300 text-sm text-center py-4">No activity recorded yet</p>
        ) : (
          <div className="space-y-3">
            {complaint.auditLogs?.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{log.actor?.name}</span>
                  <span className="text-gray-400 mx-1">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
                  {log.oldValue && (
                    <span className="text-gray-400">
                      from <span className="font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{log.oldValue}</span>
                    </span>
                  )}
                  {log.newValue && (
                    <span className="text-gray-400 ml-1">
                      → <span className="font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">{log.newValue}</span>
                    </span>
                  )}
                  <p className="text-gray-300 text-xs mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintDetail