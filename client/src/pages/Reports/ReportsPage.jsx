import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Table2, Loader2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const reportTypes = [
  {
    id: 'story_summary',
    title: 'Story Summary Report',
    description: 'Overview of all stories with status, category, and reporter breakdown.',
    icon: FileText,
    color: 'indigo',
  },
  {
    id: 'reporter_performance',
    title: 'Reporter Performance',
    description: 'Individual reporter output, turnaround time, and completion rates.',
    icon: Table2,
    color: 'purple',
  },
  {
    id: 'pipeline_status',
    title: 'Pipeline Status Report',
    description: 'Current pipeline stages — draft, in-review, approved, published.',
    icon: FileText,
    color: 'amber',
  },
]

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const handleGenerate = (id) => {
    setGenerating(id)
    setTimeout(() => setGenerating(null), 2000)
  }

  if (loading) return (
    <AppLayout title="Reports">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Reports">
      <PageHeader
        title="Reports"
        subtitle="Generate and download reports for stories, reporters, and pipeline activity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, i) => {
          const Icon = report.icon
          const isGenerating = generating === report.id
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 flex flex-col gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${report.color}-100 dark:bg-${report.color}-900/30`}>
                <Icon size={20} className={`text-${report.color}-600 dark:text-${report.color}-400`} />
              </div>
              <div>
                <h3 className="font-semibold text-surface-800 dark:text-white">{report.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{report.description}</p>
              </div>
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => handleGenerate(report.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {isGenerating
                    ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                    : <><Download size={14} /> Export PDF</>
                  }
                </button>
                <button
                  onClick={() => handleGenerate(report.id + '_csv')}
                  disabled={!!generating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-60"
                >
                  CSV
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </AppLayout>
  )
}
