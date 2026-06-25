import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const mockDepartments = [
  { id: 1, name: 'Politics', head: 'Arjun Reddy', reporters: 5, stories: 120 },
  { id: 2, name: 'Sports', head: 'Sneha Patel', reporters: 4, stories: 89 },
  { id: 3, name: 'Business', head: 'Kiran Rao', reporters: 3, stories: 67 },
  { id: 4, name: 'Technology', head: 'Meera Nair', reporters: 2, stories: 41 },
  { id: 5, name: 'Culture & Arts', head: 'Rahul Desai', reporters: 3, stories: 33 },
]

export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newHead, setNewHead] = useState('')

  useEffect(() => {
    setTimeout(() => { setDepartments(mockDepartments); setLoading(false) }, 400)
  }, [])

  const handleAdd = () => {
    if (!newName.trim()) return
    setDepartments(prev => [...prev, { id: Date.now(), name: newName, head: newHead || '—', reporters: 0, stories: 0 }])
    setNewName(''); setNewHead(''); setAdding(false)
  }

  if (loading) return (
    <AppLayout title="Departments">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading departments..." />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Departments">
      <PageHeader
        title="Departments"
        subtitle="Manage newsroom departments and their leads"
        action={
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Add Department
          </button>
        }
      />

      {/* Add Form */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800 shadow-sm mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-surface-500 mb-1 block">Department Name</label>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="e.g. Science & Environment"
              className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-surface-500 mb-1 block">Department Head</label>
            <input value={newHead} onChange={e => setNewHead(e.target.value)} placeholder="e.g. Anita Singh"
              className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept, i) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex gap-1.5">
                <button className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-indigo-500 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget(dept)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-surface-800 dark:text-white text-base">{dept.name}</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Head: {dept.head}</p>
            <div className="flex gap-4 mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{dept.reporters}</div>
                <div className="text-xs text-surface-400">Reporters</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{dept.stories}</div>
                <div className="text-xs text-surface-400">Stories</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Department"
        message={`Delete "${deleteTarget?.name}"? Reporters in this department will be unassigned.`}
        onConfirm={() => setDepartments(d => d.filter(x => x.id !== deleteTarget.id))}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
