import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { BookOpen, Users, Clock, CheckCircle, TrendingUp, AlertTriangle, Activity, Plus, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatsCard from '../../components/common/StatsCard'
import { analyticsAPI } from '../../services/api'
import { formatRelative, getStatusLabel } from '../../utils/helpers'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const COLORS = ['#E11D48', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0891B2']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, cat, monthly] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          analyticsAPI.getCategoryWise(),
          analyticsAPI.getMonthlyProductivity(),
        ])
        setStats(s)
        setCategoryData(cat.data || [])
        setMonthlyData(monthly.data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <AppLayout title="Dashboard"><LoadingSpinner size="lg" text="Loading dashboard..." /></AppLayout>

  return (
    <AppLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Stories" value={stats?.totalStories ?? 0} icon={BookOpen} color="#E11D48" delay={0} />
          <StatsCard title="Active Reporters" value={stats?.activeReporters ?? 0} icon={Users} color="#2563EB" delay={0.05} />
          <StatsCard title="Pending Review" value={stats?.pendingStories ?? 0} icon={Clock} color="#D97706" delay={0.1} />
          <StatsCard title="Published" value={stats?.publishedStories ?? 0} icon={CheckCircle} color="#16A34A" delay={0.15} />
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

        {/* Recent Activity + Deadline Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-800 dark:text-white">Recent Stories</h3>
              <Link to="/stories" className="text-xs text-primary-500 hover:text-primary-600 font-medium">View all</Link>
            </div>
            {stats?.recentStories?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentStories.map(s => (
                  <Link to={`/stories/${s.id}`} key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
                      <BookOpen size={16} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-surface-400">{s.reporter_name} &middot; {formatRelative(s.created_at)}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-surface-400 text-sm py-4">No recent stories</p>
            )}
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-800 dark:text-white">Overdue Stories</h3>
              <span className="badge badge-danger">{stats?.overdueStories?.length || 0}</span>
            </div>
            {stats?.overdueStories?.length > 0 ? (
              <div className="space-y-3">
                {stats.overdueStories.map(s => (
                  <Link to={`/stories/${s.id}`} key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-red-500">{s.reporter_name} — overdue</p>
                    </div>
                    <PriorityBadge priority={s.priority} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle size={32} className="text-green-400 mb-2" />
                <p className="text-sm text-surface-400">No overdue stories!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="card p-6">
          <h3 className="font-bold text-surface-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/stories/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Story</Link>
            <Link to="/admin/users" className="btn btn-secondary btn-sm"><Users size={14} /> Manage Users</Link>
            <Link to="/analytics" className="btn btn-ghost btn-sm border border-surface-200 dark:border-surface-700"><TrendingUp size={14} /> View Analytics</Link>
            <Link to="/reports" className="btn btn-ghost btn-sm border border-surface-200 dark:border-surface-700"><Eye size={14} /> Generate Report</Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
