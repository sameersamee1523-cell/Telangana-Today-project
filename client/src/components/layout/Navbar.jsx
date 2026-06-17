import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Sun, Moon, User, Settings, LogOut, ChevronDown, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationContext'
import { getInitials, getRoleLabel, formatRelative } from '../../utils/helpers'

export default function Navbar({ title = 'Dashboard' }) {
  const { user, logout } = useAuth()
  const { dark, toggleDark } = useTheme()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications() || { notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {} }
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [search, setSearch] = useState('')
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-[72px] bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-700 flex items-center px-6 gap-4 sticky top-0 z-10 shadow-sm">
      <div className="flex-1">
        <h1 className="text-lg font-bold text-surface-800 dark:text-white">{title}</h1>
      </div>

      <div className="relative hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stories..."
          className="pl-9 pr-8 py-2 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 transition dark:text-white dark:placeholder-surface-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X size={14} className="text-surface-400" />
          </button>
        )}
      </div>

      <button
        onClick={toggleDark}
        className="p-2 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition"
        title="Toggle theme"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setShowNotif(s => !s); setShowUser(false) }}
          className="p-2 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition relative"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-card-hover border border-surface-100 dark:border-surface-700 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                <h3 className="font-semibold text-sm dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-surface-400 text-sm py-8">No notifications</p>
                ) : notifications.slice(0, 10).map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`px-4 py-3 border-b border-surface-50 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-700 transition ${
                      !n.is_read ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{n.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-surface-400 mt-1">{formatRelative(n.created_at)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" ref={userRef}>
        <button
          onClick={() => { setShowUser(s => !s); setShowNotif(false) }}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-surface-800 dark:text-white leading-none">{user?.name}</p>
            <p className="text-xs text-surface-400">{getRoleLabel(user?.role)}</p>
          </div>
          <ChevronDown size={14} className="text-surface-400 hidden md:block" />
        </button>
        <AnimatePresence>
          {showUser && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-2xl shadow-card-hover border border-surface-100 dark:border-surface-700 overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                <p className="text-sm font-semibold dark:text-white">{user?.name}</p>
                <p className="text-xs text-surface-400 truncate">{user?.email}</p>
              </div>
              <button onClick={() => { navigate('/profile'); setShowUser(false) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition dark:text-surface-300">
                <User size={15} /> Profile
              </button>
              <button onClick={() => { navigate('/settings'); setShowUser(false) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition dark:text-surface-300">
                <Settings size={15} /> Settings
              </button>
              <hr className="border-surface-100 dark:border-surface-700" />
              <button onClick={() => { logout(); navigate('/login') }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                <LogOut size={15} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
