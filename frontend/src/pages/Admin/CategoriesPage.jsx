import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']

const mockCategories = [
  { id: 1, name: 'Politics', slug: 'politics', color: '#6366f1', count: 84 },
  { id: 2, name: 'Sports', slug: 'sports', color: '#10b981', count: 62 },
  { id: 3, name: 'Business', slug: 'business', color: '#f59e0b', count: 47 },
  { id: 4, name: 'Technology', slug: 'technology', color: '#3b82f6', count: 38 },
  { id: 5, name: 'Culture', slug: 'culture', color: '#ec4899', count: 29 },
  { id: 6, name: 'Health', slug: 'health', color: '#14b8a6', count: 21 },
]

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  useEffect(() => {
    setTimeout(() => { setCategories(mockCategories); setLoading(false) }, 400)
  }, [])

  const handleAdd = () => {
    if (!newName.trim()) return
    setCategories(prev => [...prev, {
      id: Date.now(), name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-'), color: newColor, count: 0
    }])
    setNewName(''); setAdding(false)
  }

  if (loading) return (
    <AppLayout title="Categories">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Categories">
      <PageHeader
        title="Categories"
        subtitle="Manage story categories and tags"
        action={
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Add Category
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
            <label className="text-xs font-medium text-surface-500 mb-1 block">Category Name</label>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Science"
              className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${newColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '22' }}>
              <Tag size={18} style={{ color: cat.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-surface-800 dark:text-white truncate">{cat.name}</div>
              <div className="text-xs text-surface-400 mt-0.5">{cat.count} stories · /{cat.slug}</div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-indigo-500 transition-colors"><Edit2 size={14} /></button>
              <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Stories in this category will be uncategorized.`}
        onConfirm={() => setCategories(c => c.filter(x => x.id !== deleteTarget.id))}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
