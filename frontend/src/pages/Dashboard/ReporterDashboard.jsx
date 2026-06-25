import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, Clock, CheckCircle, AlertTriangle, ArrowRight, Circle, Users, Pencil, Eye, Star, Send, Plus, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatsCard from '../../components/common/StatsCard'
import { storiesAPI, analyticsAPI } from '../../services/api'
import { formatDate, formatRelative, isOverdue } from '../../utils/helpers'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

const CAT_COLORS = ['#E11D48', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4']

const WORKFLOW_STAGES = [
  { key: 'draft',        label: 'Draft',        icon: Circle,  color: '#64748B', bg: '#F1F5F9' },
  { key: 'assigned',     label: 'Assigned',     icon: Users,   color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'in_progress',  label: 'In Progress',  icon: Pencil,  color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'under_review', label: 'Under Review', icon: Eye,     color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'published',    label: 'Published',    icon: Star,    color: '#10B981', bg: '#ECFDF5' },
]

export default function ReporterDashboard() {
  const { user } = useAuth()
  const [stories, setStories]           = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [workflowData, setWorkflowData] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      storiesAPI.getAll({ reporter_id: user?.id, limit: 20 }),
      analyticsAPI.getCategoryWise(),
    ])
      .then(([storiesRes, catRes]) => {
        const allStories = storiesRes?.stories || []
        setStories(allStories)

        const catArr = Array.isArray(catRes) ? catRes : (catRes?.data || [])
        setCategoryData(catArr)

        // Build workflow data from reporter's own stories
        const counts = {}
        allStories.forEach(st => { counts[st.status] = (counts[st.status] || 0) + 1 })
        const total = allStories.length || 1
        setWorkflowData(
          WORKFLOW_STAGES.map(stage => ({
            ...stage,
            count:   counts[stage.key] || 0,
            percent: Math.round(((counts[stage.key] || 0) / total) * 100),
          }))
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <AppLayout title="My Dashboard">
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </AppLayout>
  )

  const inProgress = stories.filter(s => ['assigned', 'in_progress'].includes(s.status))
  const submitted  = stories.filter(s => ['submitted', 'under_review'].includes(s.status))
  const published  = stories.filter(s => s.status === 'published')
  const overdue    = stories.filter(s => isOverdue(s.deadline) && !['published', 'rejected'].includes(s.status))
  const firstName  = user?.name?.split(' ')[0] || 'Reporter'

  // Activity feed: synthesise from own stories
  const activityItems = [
    ...inProgress.slice(0, 2).map(s => ({ icon: Pencil, color: '#8B5CF6', bg: '#F5F3FF', label: 'In Progress', title: s.title, time: s.updated_at || s.created_at })),
    ...submitted.slice(0, 1).map(s  => ({ icon: Send,   color: '#F59E0B', bg: '#FFFBEB', label: 'Submitted',   title: s.title, time: s.updated_at || s.created_at })),
    ...published.slice(0, 1).map(s  => ({ icon: Star,   color: '#10B981', bg: '#ECFDF5', label: 'Published',   title: s.title, time: s.updated_at || s.created_at })),
    ...overdue.slice(0, 1).map(s    => ({ icon: AlertTriangle, color: '#E11D48', bg: '#FFF1F3', label: 'Overdue', title: s.title, time: s.deadline })),
  ].slice(0, 5)

  return (
    <AppLayout title="My Dashboard">
      <div className="space-y-6 pb-6">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0B132B 0%, #1a2545 50%, #0B132B 100%)', boxShadow: '0 8px 32px rgba(11,19,43,0.4)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #E11D48 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-40 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)', transform: 'translateY(40%)' }} />
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #E11D48 0%, #F43F5E 50%, transparent 100%)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #E11D48, #F43F5E)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>My Newsroom</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                Good day, {firstName}! ✌️
              </h2>
              <p className="text-sm" style={{ color: 'rgba(148,163,184,0.75)' }}>
                {inProgress.length} active {inProgress.length === 1 ? 'assignment' : 'assignments'}
                {overdue.length > 0 ? ` · ${overdue.length} overdue` : ' · No overdue stories'}
              </p>
            </div>
            <Link to="/stories"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
              <BookOpen size={13} /> My Stories
            </Link>
          </div>
        </motion.div>

        {/* Top Row: Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="My Stories"  value={stories.length}    icon={BookOpen}     color="#E11D48" delay={0}    />
          <StatsCard title="In Progress" value={inProgress.length} icon={Clock}        color="#3B82F6" delay={0.05} />
          <StatsCard title="Published"   value={published.length}  icon={CheckCircle}  color="#10B981" delay={0.1}  />
          <StatsCard title="Overdue"     value={overdue.length}    icon={AlertTriangle} color="#F59E0B" delay={0.15} />
        </div>

        {/* Middle Row: Workflow + Category */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Story Workflow Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white text-base">My Story Workflow</h3>
                <p className="text-xs text-surface-400 mt-0.5">Your pipeline breakdown</p>
              </div>
              <Activity size={16} className="text-primary-500" />
            </div>
            <div className="space-y-3">
              {workflowData.map((stage) => {
                const Icon = stage.icon
                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: stage.bg, color: stage.color }}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">{stage.label}</span>
                        <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.count}</span>
                      </div>
                      <div className="workflow-bar">
                        <motion.div className="workflow-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(stage.percent, stage.count > 0 ? 4 : 0)}%` }}
                          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                          style={{ background: stage.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-surface-400 w-8 text-right shrink-0">{stage.percent}%</span>
                  </div>
                )
              })}
            </div>
            {workflowData.some(s => s.count > 0) && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={workflowData.filter(s => s.count > 0)} cx="50%" cy="50%"
                      innerRadius={36} outerRadius={54} dataKey="count" paddingAngle={3}>
                      {workflowData.filter(s => s.count > 0).map((stage) => (
                        <Cell key={stage.key} fill={stage.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }}
                      formatter={(v, n, p) => [v, p.payload.label]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Stories by Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white text-base">Stories by Category</h3>
                <p className="text-xs text-surface-400 mt-0.5">Distribution across topics</p>
              </div>
            </div>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="52%" height={190}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={46} outerRadius={72} dataKey="count" paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} formatter={(v) => [v, 'Stories']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {categoryData.slice(0, 5).map((c, i) => (
                    <div key={c.category} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                      <span className="text-xs text-surface-500 truncate flex-1">{c.category}</span>
                      <span className="text-xs font-bold text-surface-700">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-surface-400">No category data yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Row: Active Assignments + Activity Feed */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Active Assignments (Recent Stories) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white text-base">Active Assignments</h3>
                <p className="text-xs text-surface-400 mt-0.5">Stories currently in your pipeline</p>
              </div>
              <Link to="/stories" className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {inProgress.length > 0 ? (
              <div className="space-y-2.5">
                {inProgress.slice(0, 5).map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
                    <Link
                      to={`/stories/${s.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border"
                      style={{
                        borderColor: isOverdue(s.deadline) ? 'rgba(225,29,72,0.2)' : '#F1F5F9',
                        background: isOverdue(s.deadline) ? 'rgba(225,29,72,0.03)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                      onMouseLeave={e => e.currentTarget.style.background = isOverdue(s.deadline) ? 'rgba(225,29,72,0.03)' : 'transparent'}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-surface-800 dark:text-white text-sm truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-surface-400">{s.category_name}</span>
                          <span className="text-xs text-surface-300">·</span>
                          <span className={`text-xs font-medium ${isOverdue(s.deadline) ? 'text-primary-500' : 'text-surface-400'}`}>
                            {isOverdue(s.deadline) ? '⚠️ Overdue' : `Due ${formatDate(s.deadline)}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <PriorityBadge priority={s.priority} />
                        <StatusBadge status={s.status} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#ECFDF5' }}>
                  <CheckCircle size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-surface-500">No active assignments right now</p>
                <p className="text-xs text-surface-400 mt-1">Check back later for new story assignments</p>
              </div>
            )}
          </motion.div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white text-base">Activity Feed</h3>
                <p className="text-xs text-surface-400 mt-0.5">Your recent story events</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: '#ECFDF5', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Live</span>
              </div>
            </div>

            {activityItems.length > 0 ? (
              <div className="space-y-1">
                {activityItems.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: item.bg, color: item.color }}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                        <p className="text-xs font-semibold text-surface-700 truncate mt-0.5">{item.title}</p>
                        {item.time && (
                          <p className="text-[11px] text-surface-400">{formatRelative(item.time)}</p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#F8FAFC' }}>
                  <Activity size={20} className="text-surface-300" />
                </div>
                <p className="text-sm font-medium text-surface-500">No activity yet</p>
                <p className="text-xs text-surface-400 mt-1">Start working on stories to see activity here</p>
              </div>
            )}

            {/* My Stories table preview */}
            {stories.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-surface-600 uppercase tracking-wide">All My Stories</span>
                  <Link to="/stories" className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {stories.slice(0, 3).map(s => (
                    <Link key={s.id} to={`/stories/${s.id}`}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors"
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="text-xs text-surface-700 truncate flex-1">{s.title}</span>
                      <StatusBadge status={s.status} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </AppLayout>
  )
}
