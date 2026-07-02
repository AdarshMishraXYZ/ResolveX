import { useState, useEffect } from 'react'
import { getAllUsers, impersonateUser } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLE_COLORS = { ADMIN: 'bg-purple-100 text-purple-700', DEPARTMENT_HEAD: 'bg-blue-100 text-blue-700', STAFF: 'bg-green-100 text-green-700', CITIZEN: 'bg-gray-100 text-gray-600' }

const ROLE_ORDER = { CITIZEN: 1, STAFF: 2, DEPARTMENT_HEAD: 3, ADMIN: 4 }

const DemoMode = ({ isImpersonating, onReturnToAdmin }) => {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [switching, setSwitching] = useState(null)

  useEffect(() => {
    if (open && users.length === 0) {
      setLoading(true)
      getAllUsers()
        .then(res => setUsers(res.data.users.sort((a, b) => ROLE_ORDER[a.role.name] - ROLE_ORDER[b.role.name])))
        .catch(() => toast.error("Failed to load users"))
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleSwitch = async (targetUser) => {
    setSwitching(targetUser.id)
    try {
      const adminToken = localStorage.getItem("token")
      if (!localStorage.getItem("originalAdminToken")) {
        localStorage.setItem("originalAdminToken", adminToken)
      }
      const res = await impersonateUser(targetUser.id)
      login(res.data.token, res.data.user)
      localStorage.setItem("isImpersonating", "true")
      toast.success("Viewing as " + res.data.user.name)
      setOpen(false)
      const role = res.data.user.role
      if (role === "ADMIN") window.location.href = "/admin"
      else if (role === "STAFF" || role === "DEPARTMENT_HEAD") window.location.href = "/staff"
      else window.location.href = "/dashboard"
    } catch (err) {
      toast.error("Switch failed")
    } finally {
      setSwitching(null)
    }
  }

  const storedImpersonating = localStorage.getItem("isImpersonating") === "true"
  const effectivelyImpersonating = isImpersonating || storedImpersonating

  const handleReturnToAdmin = () => {
    const originalToken = localStorage.getItem("originalAdminToken")
    if (originalToken) {
      localStorage.setItem("token", originalToken)
      localStorage.removeItem("originalAdminToken")
      localStorage.removeItem("isImpersonating")
      window.location.href = "/admin"
    }
  }

  if (user?.role !== "ADMIN" && !effectivelyImpersonating) return null

  return (
    <>
      {effectivelyImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-4">
          <span>Demo Mode — Viewing as {user?.name} ({user?.role})</span>
          <button onClick={handleReturnToAdmin} className="bg-white text-amber-600 px-3 py-0.5 rounded text-xs font-bold">Return to Admin</button>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {open && (
          <div className="mb-3 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 max-h-96 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-800 text-sm">Switch Account</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-lg">x</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div> : (
                users.map(u => (
                  <button key={u.id} onClick={() => handleSwitch(u)} disabled={switching === u.id || u.id === user?.id}
                    className={"w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-50 " + (u.id === user?.id ? "bg-blue-50" : "")}>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{u.name.charAt(0).toUpperCase()}</div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={"text-xs px-1.5 py-0.5 rounded font-medium " + (ROLE_COLORS[u.role.name] || "")}>{u.role.name}</span>
                        {u.department && <span className="text-xs text-gray-400">{u.department.name}</span>}
                      </div>
                    </div>
                    {u.id === user?.id && <span className="text-xs text-blue-500">Current</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <button onClick={() => setOpen(prev => !prev)}
          className="bg-gray-900 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-700 transition text-lg"
          title="Demo Mode">
          👁
        </button>
      </div>
    </>
  )
}

export default DemoMode
