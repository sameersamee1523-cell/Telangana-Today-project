import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BookOpen, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatsCard from '../../components/common/StatsCard'
import { storiesAPI, analyticsAPI } from '../../services/api'

const COLORS = ['#E11D48', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2']
import { formatDate, isOverdue } from '../../utils/helpers'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

export default function ReporterDashboard() {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      storiesAPI.getAll({ reporter_id: user?.id, limit: 20 }),
      analyticsAPI.getCategoryWise(),
      analyticsAPI.getMonthlyProductivity()
    ])
      .then(([storiesRes, catRes, monthlyRes]) => {
        setStories(storiesRes.stories || [])
        setCategoryData(catRes.data || [])
        setMonthlyData(monthlyRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <AppLayout title="My Dashboard"><LoadingSpinner size="lg" /></AppLayout>

  const inProgress = stories.filter(s => ['assigned','in_progress'].includes(s.status))
  const submitted = stories.filter(s => ['submitted','under_review'].includes(s.status))
  const published = stories.filter(s => s.status === 'published')
  const overdue = stories.filter(s => isOverdue(s.deadline) && !['published','rejected'].includes(s.status))

  return (
    <AppLayout title="My Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-white"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-8" />
          <div className="relative">
            <h2 className="text-xl font-bold mb-1">Good day, {user?.name?.split(' ')[0]}! ✌️</h2>
            <p className="text-white/80 text-sm">You have {inProgress.length} active assignments and {overdue.length > 0 ? `${overdue.length} overdue` : 'no overdue'} stories.</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="My Stories" value={stories.length} icon={BookOpen} color="#E11D48" delay={0} />
          <StatsCard title="In Progress" value={inProgress.length} icon={Clock} color="#2563EB" delay={0.05} />
          <StatsCard title="Published" value={published.length} icon={CheckCircle} color="#16A34A" delay={0.1} />
          <StatsCard title="Overdue" value={overdue.length} icon={AlertTriangle} color="#D97706" delay={0.15} />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Productivity Chart */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="card p-6">
            <h3 className="font-bold text-surface-800 dark:text-white mb-4">Monthly Story Production</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" fill="#E11D48" radius={[6,6,0,0]} name="Stories" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Pie Chart */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="card p-6">
            <h3 className="font-bold text-surface-800 dark:text-white mb-4">Stories by Category</h3>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} formatter={(v) => [v, 'Stories']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryData.slice(0,5).map((c, i) => (
                    <div key={c.category} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                      <span className="text-xs text-surface-600 dark:text-surface-400 truncate flex-1">{c.category}</span>
                      <span className="text-xs font-bold text-surface-700 dark:text-surface-300">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-surface-400 text-sm py-8">No data yet</p>
            )}
          </motion.div>
        </div>

        {/* Active Assignments */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-surface-800 dark:text-white">Active Assignments</h3>
            <Link to="/stories" className="text-xs text-primary-500 hover:text-primary-600 font-medium">View all →</Link>
          </div>
          {inProgress.length > 0 ? (
            <div className="space-y-3">
              {inProgress.map(s => (
                <Link to={`/stories/${s.id}`} key={s.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                    isOverdue(s.deadline)
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                      : 'border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-800 dark:text-white text-sm truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-surface-400">{s.category_name}</span>
                      <span className="text-xs text-surface-400">&middot;</span>
                      <span className={`text-xs font-medium ${isOverdue(s.deadline) ? 'text-red-500' : 'text-surface-400'}`}>
                        {isOverdue(s.deadline) ? '⚠️ Overdue' : `Due ${formatDate(s.deadline)}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={s.priority} />
                    <StatusBadge status={s.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-surface-400">No active assignments right now</p>
            </div>
          )}
        </motion.div>

        {/* All my stories mini table */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-surface-800 dark:text-white">All My Stories</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Deadline</th></tr></thead>
              <tbody>
                {stories.slice(0,8).map(s => (
                  <tr key={s.id}>
                    <td><Link to={`/stories/${s.id}`} className="text-primary-500 hover:text-primary-600 font-medium text-sm">{s.title}</Link></td>
                    <td><span className="text-xs text-surface-500">{s.category_name}</span></td>
                    <td><StatusBadge status={s.status} /></td>
                    <td><PriorityBadge priority={s.priority} /></td>
                    <td><span className={`text-xs ${isOverdue(s.deadline) ? 'text-red-500 font-medium' : 'text-surface-400'}`}>{formatDate(s.deadline)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
