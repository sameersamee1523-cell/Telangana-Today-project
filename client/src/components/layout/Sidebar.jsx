import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BookOpen, BarChart3, FileText, Users, Shield, Tag, Settings, ChevronLeft, ChevronRight, LogOut, Newspaper, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials, getRoleLabel } from '../../utils/helpers'

const ROLE_LINKS = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stories', icon: BookOpen, label: 'Stories' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
    { to: '/admin/categories', icon: Tag, label: 'Categories' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  chief_editor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stories', icon: BookOpen, label: 'Stories' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  editor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stories', icon: BookOpen, label: 'Stories' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  reporter: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stories', icon: BookOpen, label: 'My Stories' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const links = ROLE_LINKS[user?.role] || ROLE_LINKS.reporter

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col bg-surface-900 dark:bg-surface-950 text-white h-screen shrink-0 z-20 overflow-hidden shadow-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[72px]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 shrink-0 shadow-primary">
          <Newspaper size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-bold text-sm leading-none text-white">Telangana Today</p>
              <p className="text-xs text-surface-400 mt-0.5">Pipeline Manager</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-primary'
                  : 'text-surface-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate text-white">{user?.name}</p>
                <p className="text-xs text-surface-400 truncate">{getRoleLabel(user?.role)}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="p-1.5 text-surface-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-white hover:bg-primary-500 transition-colors shadow-md z-30"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
