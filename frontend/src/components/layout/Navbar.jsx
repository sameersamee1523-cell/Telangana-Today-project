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
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications() || {
    notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {}
  }
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
    <header className="h-[68px] bg-white dark:bg-surface-900 flex items-center px-6 gap-4 sticky top-0 z-10"
      style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex-1">
        <h1 className="text-base font-bold text-surface-900 dark:text-white tracking-tight">{title}</h1>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stories..."
          className="pl-9 pr-8 py-2 text-sm rounded-xl w-60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:w-72 transition-all duration-300"
          style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#0F172A' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X size={13} className="text-surface-400" />
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleDark}
        className="p-2 rounded-xl transition-all duration-200"
        style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#64748B' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#E11D48'; e.currentTarget.style.color = '#E11D48' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
        title="Toggle theme"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setShowNotif(s => !s); setShowUser(false) }}
          className="p-2 rounded-xl transition-all duration-200 relative"
          style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#64748B' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#E11D48'; e.currentTarget.style.color = '#E11D48' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-2xl overflow-hidden z-50"
              style={{ border: '1px solid #E2E8F0', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-primary-500" />
                  <h3 className="font-bold text-sm text-surface-800 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #E11D48, #F43F5E)' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-10">
                    <Bell size={24} className="text-surface-300 mx-auto mb-2" />
                    <p className="text-sm text-surface-400">No notifications yet</p>
                  </div>
                ) : notifications.slice(0, 10).map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className="px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      background: !n.is_read ? 'rgba(225,29,72,0.04)' : 'white',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                    onMouseLeave={e => e.currentTarget.style.background = !n.is_read ? 'rgba(225,29,72,0.04)' : 'white'}
                  >
                    {!n.is_read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 float-right mt-1.5 ml-2" />
                    )}
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 leading-snug">{n.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-surface-400 mt-1">{formatRelative(n.created_at)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User menu */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => { setShowUser(s => !s); setShowNotif(false) }}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200"
          style={{ border: '1.5px solid #E2E8F0' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#E11D48'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)' }}
          >
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-surface-800 dark:text-white leading-none">{user?.name}</p>
            <p className="text-[11px] text-surface-400 mt-0.5">{getRoleLabel(user?.role)}</p>
          </div>
          <ChevronDown size={13} className="text-surface-400 hidden md:block" />
        </button>
        <AnimatePresence>
          {showUser && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-surface-800 rounded-2xl overflow-hidden z-50"
              style={{ border: '1px solid #E2E8F0', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}
            >
              <div className="px-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9', background: '#FFF8F9' }}>
                <p className="text-sm font-bold text-surface-800">{user?.name}</p>
                <p className="text-xs text-surface-400 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/profile'); setShowUser(false) }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-surface-700 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={14} className="text-surface-400" /> Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowUser(false) }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-surface-700 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} className="text-surface-400" /> Settings
                </button>
                <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 transition-colors font-medium"
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
