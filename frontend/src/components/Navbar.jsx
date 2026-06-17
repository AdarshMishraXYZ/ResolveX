import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { getNotifications, markAsRead } from '../api/complaintApi'
import { useSocket } from '../context/SocketContext'
import { Bell, LogOut, ChevronDown } from 'lucide-react'

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700',
  DEPARTMENT_HEAD: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-green-100 text-green-700',
  CITIZEN: 'bg-gray-100 text-gray-600',
}

const Navbar = () => {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    if (user) {
      getNotifications().then((res) => setNotifications(res.data.notifications))
    }
  }, [user])

  useEffect(() => {
    if (socket) {
      socket.on('notification', ({ notification }) => {
        setNotifications((prev) => [notification, ...prev])
      })
    }
  }, [socket])

  const unread = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id) => {
    await markAsRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin'
    if (user?.role === 'STAFF' || user?.role === 'DEPARTMENT_HEAD') return '/staff'
    return '/dashboard'
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-0 flex items-center justify-between sticky top-0 z-50 h-16 shadow-sm">
      <Link to={getDashboardLink()} className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="text-lg font-bold text-gray-900">ResolveX</span>
      </Link>

      <div className="flex items-center gap-3">
        {user && (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{fontSize:'9px'}}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                    {unread > 0 && <span className="text-xs text-blue-600 font-medium">{unread} unread</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-gray-400 text-sm text-center">
                        <Bell size={24} className="mx-auto mb-2 opacity-30" />
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`px-4 py-3 border-b border-gray-50 text-sm cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                        >
                          <p className="text-gray-700 leading-snug">{n.message}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-default">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800 leading-none">{user.name}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[user.role]}`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar