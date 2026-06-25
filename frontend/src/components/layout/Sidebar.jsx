import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, BarChart3, FileText, Users, Shield,
  Tag, Settings, ChevronLeft, ChevronRight, LogOut, Newspaper, Building2
} from 'lucide-react'
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
      animate={{ width: collapsed ? 70 : 248 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ background: 'linear-gradient(180deg, #0B132B 0%, #091023 100%)' }}
      className="relative flex flex-col text-white h-screen shrink-0 z-20 overflow-hidden"
    >
      {/* Subtle red ambient glow at top */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(225,29,72,0.18) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 min-h-[72px] shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
            boxShadow: '0 4px 15px rgba(225,29,72,0.45)',
          }}
        >
          <Newspaper size={19} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-bold text-sm leading-none text-white">Telangana Today</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
                Pipeline Manager
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav section label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(100,116,139,0.7)' }}
          >
            Navigation
          </motion.p>
        )}
      </AnimatePresence>

      {/* Nav links */}
      <nav className="flex-1 py-1 px-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="shrink-0" />
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
      <div
        className="p-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)' }}
          >
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
                <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                <p className="text-[11px] truncate" style={{ color: 'rgba(148,163,184,0.65)' }}>
                  {getRoleLabel(user?.role)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-all duration-200 shrink-0"
            style={{ color: 'rgba(148,163,184,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.background = 'transparent' }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute top-[88px] -right-3 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all duration-200 z-30 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
          boxShadow: '0 2px 10px rgba(225,29,72,0.4)',
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
