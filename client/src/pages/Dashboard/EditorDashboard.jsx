import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BookOpen, Clock, CheckCircle, AlertTriangle, Eye, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

const COLORS = ['#E11D48', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2']
import AppLayout from '../../components/layout/AppLayout'
import StatsCard from '../../components/common/StatsCard'
import { storiesAPI, analyticsAPI } from '../../services/api'
import { formatDate, formatRelative, isOverdue } from '../../utils/helpers'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function EditorDashboard() {
  const [stories, setStories] = useState([])
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, statsRes, catRes, monthlyRes] = await Promise.all([
          storiesAPI.getAll({ status: 'submitted,under_review', limit: 10 }),
          analyticsAPI.getDashboardStats(),
          analyticsAPI.getCategoryWise(),
          analyticsAPI.getMonthlyProductivity(),
        ])
        setStories(storiesRes.stories || [])
        setStats(statsRes)
        setCategoryData(catRes.data || [])
        setMonthlyData(monthlyRes.data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <AppLayout title="Dashboard"><LoadingSpinner size="lg" text="Loading..." /></AppLayout>

  return (
    <AppLayout title="Editor Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Assigned Stories" value={stats?.totalStories ?? 0} icon={BookOpen} color="#E11D48" delay={0} />
          <StatsCard title="Under Review" value={stats?.pendingStories ?? 0} icon={Eye} color="#2563EB" delay={0.05} />
          <StatsCard title="Published Today" value={stats?.publishedStories ?? 0} icon={CheckCircle} color="#16A34A" delay={0.1} />
          <StatsCard title="Overdue" value={stats?.overdueStories?.length ?? 0} icon={AlertTriangle} color="#D97706" delay={0.15} />
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

        {/* Review Queue */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-surface-800 dark:text-white">Stories Awaiting Review</h3>
              <p className="text-sm text-surface-400 mt-0.5">Stories submitted by reporters for your review</p>
            </div>
            <Link to="/stories" className="btn btn-ghost btn-sm border border-surface-200 dark:border-surface-700"><Filter size={14} /> All Stories</Link>
          </div>
          {stories.length > 0 ? (
            <div className="space-y-3">
              {stories.map(s => (
                <Link to={`/stories/${s.id}`} key={s.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition hover:shadow-sm ${
                    isOverdue(s.deadline)
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                      : 'border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-surface-800 dark:text-white text-sm">{s.title}</p>
                      <StatusBadge status={s.status} />
                      <PriorityBadge priority={s.priority} />
                    </div>
                    <p className="text-xs text-surface-400 mt-1">
                      By {s.reporter_name} &middot; {s.category_name} &middot; Due {formatDate(s.deadline)}
                    </p>
                  </div>
                  {isOverdue(s.deadline) && <AlertTriangle size={16} className="text-red-500 shrink-0" />}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-surface-400">Review queue is empty — great work!</p>
            </div>
          )}
        </motion.div>

        {/* Overdue Alerts */}
        {stats?.overdueStories?.length > 0 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="card p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Deadline Alerts ({stats.overdueStories.length} overdue)
            </h3>
            <div className="space-y-2">
              {stats.overdueStories.map(s => (
                <Link to={`/stories/${s.id}`} key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-white">{s.title}</p>
                    <p className="text-xs text-red-500">{s.reporter_name} — Past deadline</p>
                  </div>
                  <PriorityBadge priority={s.priority} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
