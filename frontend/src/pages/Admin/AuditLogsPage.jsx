import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Search, Filter } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const mockLogs = [
  { id: 1, user: 'Ravi Kumar', action: 'Approved story', target: 'Telangana Budget 2025', timestamp: '2026-06-12 09:30', type: 'approve' },
  { id: 2, user: 'Priya Sharma', action: 'Assigned reporter', target: 'Elections Coverage', timestamp: '2026-06-12 09:15', type: 'assign' },
  { id: 3, user: 'Arjun Reddy', action: 'Created story', target: 'Monsoon Update', timestamp: '2026-06-12 08:50', type: 'create' },
  { id: 4, user: 'Sneha Patel', action: 'Submitted for review', target: 'IPL Finals Report', timestamp: '2026-06-12 08:30', type: 'submit' },
  { id: 5, user: 'Kiran Rao', action: 'Deleted draft', target: 'Old Draft 204', timestamp: '2026-06-11 17:10', type: 'delete' },
  { id: 6, user: 'Ravi Kumar', action: 'Updated user role', target: 'Sneha Patel → Editor', timestamp: '2026-06-11 16:45', type: 'update' },
]

const TYPE_COLORS = {
  approve: 'green', assign: 'indigo', create: 'blue',
  submit: 'amber', delete: 'red', update: 'purple'
}

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTimeout(() => { setLogs(mockLogs); setLoading(false) }, 500)
  }, [])

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <AppLayout title="Audit Logs">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading audit logs..." />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Audit Logs">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all user actions and system events"
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
              <th className="text-left px-6 py-3 text-surface-500 font-medium">User</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Action</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Target</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Type</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-surface-800 dark:text-white">{log.user}</td>
                <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{log.action}</td>
                <td className="px-6 py-4 text-surface-500 dark:text-surface-400">{log.target}</td>
                <td className="px-6 py-4">
                  <Badge variant={TYPE_COLORS[log.type]}>{log.type}</Badge>
                </td>
                <td className="px-6 py-4 text-surface-400 font-mono text-xs">{log.timestamp}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-surface-400">No logs found.</div>
        )}
      </motion.div>
    </AppLayout>
  )
}
