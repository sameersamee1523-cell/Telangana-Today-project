import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, FileText, Users, Clock, Award } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import StatsCard from '../../components/common/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

const mockBarData = [
  { month: 'Jan', stories: 42 }, { month: 'Feb', stories: 58 },
  { month: 'Mar', stories: 47 }, { month: 'Apr', stories: 63 },
  { month: 'May', stories: 71 }, { month: 'Jun', stories: 55 },
]
const mockLineData = [
  { week: 'W1', published: 12, draft: 8 }, { week: 'W2', published: 19, draft: 5 },
  { week: 'W3', published: 15, draft: 11 }, { week: 'W4', published: 22, draft: 6 },
]
const mockPieData = [
  { name: 'Politics', value: 30 }, { name: 'Sports', value: 22 },
  { name: 'Business', value: 18 }, { name: 'Tech', value: 15 },
  { name: 'Culture', value: 10 }, { name: 'Other', value: 5 },
]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) return (
    <AppLayout title="Analytics">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Analytics">
      <PageHeader
        title="Analytics"
        subtitle="Track story performance, reporter output, and pipeline metrics"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Total Stories" value="336" icon={FileText} color="#6366f1" trend="up" trendValue={12} />
        <StatsCard title="Published" value="284" icon={Award} color="#10b981" trend="up" trendValue={8} />
        <StatsCard title="Avg. Turnaround" value="2.4d" icon={Clock} color="#f59e0b" trend="down" trendValue={5} />
        <StatsCard title="Active Reporters" value="18" icon={Users} color="#8b5cf6" trend="up" trendValue={2} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-surface-800 dark:text-white">Stories per Month</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="stories" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-purple-500" />
            <h2 className="font-semibold text-surface-800 dark:text-white">Published vs Draft (Weekly)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="published" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="draft" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800"
      >
        <h2 className="font-semibold text-surface-800 dark:text-white mb-4">Stories by Category</h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={mockPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </AppLayout>
  )
}
