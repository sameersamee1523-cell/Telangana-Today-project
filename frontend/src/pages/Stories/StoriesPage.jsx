import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, LayoutGrid, List, Search, X, BookOpen, Activity, ChevronRight, Pencil, Trash2, Eye, Filter, RefreshCw } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { storiesAPI, adminAPI, usersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDate, isOverdue, truncate, getStatusLabel } from '../../utils/helpers'
import toast from 'react-hot-toast'

const KANBAN_COLS = [
  { id: 'draft', label: 'Draft', color: '#64748b' },
  { id: 'assigned', label: 'Assigned', color: '#3b82f6' },
  { id: 'in_progress', label: 'In Progress', color: '#6366f1' },
  { id: 'submitted', label: 'Submitted', color: '#f59e0b' },
  { id: 'under_review', label: 'Under Review', color: '#f97316' },
  { id: 'approved', label: 'Approved', color: '#14b8a6' },
  { id: 'published', label: 'Published', color: '#22c55e' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
]

function KanbanCard({ story, index, canEdit, onDelete }) {
  return (
    <Draggable draggableId={String(story.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-surface-800 rounded-xl p-3 shadow-sm border border-surface-100 dark:border-surface-700 cursor-grab select-none ${
            snapshot.isDragging ? 'shadow-lg rotate-1 opacity-90 cursor-grabbing' : ''
          }`}
        >
          <Link to={`/stories/${story.id}`}>
            <p className="text-sm font-semibold text-surface-800 dark:text-white mb-2 line-clamp-2 leading-snug">{story.title}</p>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <PriorityBadge priority={story.priority} />
              {story.category_name && (
                <span className="text-xs text-surface-400 bg-surface-50 dark:bg-surface-700 px-2 py-0.5 rounded-full">{story.category_name}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {story.reporter_name?.[0] || '?'}
                </div>
                <span className="text-xs text-surface-400 truncate max-w-[80px]">{story.reporter_name || 'Unassigned'}</span>
              </div>
              {story.deadline && (
                <span className={`text-xs font-medium ${
                  isOverdue(story.deadline) ? 'text-red-500' : 'text-surface-400'
                }`}>
                  {isOverdue(story.deadline) ? '⚠ Overdue' : formatDate(story.deadline, 'MMM dd')}
                </span>
              )}
            </div>
          </Link>
          {/* Admin action buttons on kanban card */}
          {canEdit && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-surface-100 dark:border-surface-700">
              <Link
                to={`/stories/${story.id}`}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-semibold text-surface-500 hover:bg-surface-50 hover:text-primary-500 transition-all"
                title="View"
              >
                <Eye size={11} /> View
              </Link>
              <Link
                to={`/stories/${story.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-semibold text-surface-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                title="Edit"
              >
                <Pencil size={11} /> Edit
              </Link>
              <button
                onClick={() => onDelete(story.id, story.title)}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-semibold text-surface-500 hover:bg-red-50 hover:text-red-500 transition-all"
                title="Delete"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default function StoriesPage() {
  const { user } = useAuth()
  const [view, setView] = useState('list')
  const [stories, setStories] = useState([])
  const [kanban, setKanban] = useState({})
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category_id: '' })
  const canCreate = ['admin', 'chief_editor', 'editor'].includes(user?.role)
  const canEdit   = ['admin', 'chief_editor'].includes(user?.role)

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await storiesAPI.delete(id)
      toast.success('Story deleted')
      fetchStories()
    } catch {
      toast.error('Failed to delete story')
    }
  }

  const fetchStories = useCallback(async () => {
    setLoading(true)
    try {
      if (view === 'kanban') {
        const res = await storiesAPI.getKanban()
        setKanban(res.kanban || {})
      } else {
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
        const res = await storiesAPI.getAll(params)
        setStories(res.stories || [])
      }
    } catch (e) {
      toast.error('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }, [view, filters])

  useEffect(() => { fetchStories() }, [fetchStories])

  useEffect(() => {
    adminAPI.getCategories().then(r => setCategories(r.categories || [])).catch(() => {})
  }, [])

  const onDragEnd = async (result) => {
    const { draggableId, destination, source } = result
    if (!destination || destination.droppableId === source.droppableId) return
    const storyId = parseInt(draggableId)
    const newStatus = destination.droppableId
    setKanban(prev => {
      const src = [...(prev[source.droppableId] || [])]
      const dst = [...(prev[destination.droppableId] || [])]
      const [moved] = src.splice(source.index, 1)
      dst.splice(destination.index, 0, { ...moved, status: newStatus })
      return { ...prev, [source.droppableId]: src, [destination.droppableId]: dst }
    })
    try {
      await storiesAPI.updateStatus(storyId, { status: newStatus, comment: `Moved to ${newStatus} via Kanban board` })
      toast.success(`Moved to ${getStatusLabel(newStatus)}`)
    } catch {
      toast.error('Failed to update status')
      fetchStories()
    }
  }

  const setFilter = (k, v) => setFilters(prev => ({ ...prev, [k]: v }))
  const clearFilters = () => setFilters({ search: '', status: '', priority: '', category_id: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <AppLayout title="Stories">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-800 dark:text-white">Story Pipeline</h1>
            <p className="text-sm text-surface-400 mt-1">
              {view === 'kanban' ? `${Object.values(kanban).flat().length} total stories` : `${stories.length} stories`}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Refresh */}
            <button onClick={fetchStories} title="Refresh" className="p-2 rounded-xl text-surface-400 hover:text-primary-500 hover:bg-surface-100 transition-all">
              <RefreshCw size={15} />
            </button>
            {/* View toggle */}
            <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
              {[{ id: 'kanban', icon: LayoutGrid, label: 'Kanban' }, { id: 'list', icon: List, label: 'List' }, { id: 'timeline', icon: Activity, label: 'Timeline' }].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  title={label}
                  className={`p-2 rounded-lg transition-all ${
                    view === id
                      ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-500'
                      : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            {canCreate && (
              <Link to="/stories/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> New Story
              </Link>
            )}
          </div>
        </div>

        {/* Filters — only in list/timeline */}
        {view !== 'kanban' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  value={filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                  placeholder="Search stories..."
                  className="input pl-9 py-2 text-sm"
                />
              </div>
              <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className="input py-2 text-sm w-36">
                <option value="">All Status</option>
                {KANBAN_COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select value={filters.priority} onChange={e => setFilter('priority', e.target.value)} className="input py-2 text-sm w-36">
                <option value="">All Priority</option>
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <select value={filters.category_id} onChange={e => setFilter('category_id', e.target.value)} className="input py-2 text-sm w-40">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm text-red-500">
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading stories..." />
        ) : view === 'kanban' ? (
          <div className="overflow-x-auto pb-4 -mx-6 px-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4" style={{ minWidth: '1200px' }}>
                {KANBAN_COLS.map(col => (
                  <div key={col.id} className="bg-surface-50 dark:bg-surface-800 rounded-2xl p-3 w-52 shrink-0 flex flex-col gap-2 border border-surface-100 dark:border-surface-700">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-xs font-bold text-surface-600 dark:text-surface-400 uppercase tracking-wide">{col.label}</span>
                      </div>
                      <span className="text-xs bg-surface-200 dark:bg-surface-700 text-surface-500 px-2 py-0.5 rounded-full font-medium">
                        {(kanban[col.id] || []).length}
                      </span>
                    </div>
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex flex-col gap-2 min-h-[60px] rounded-xl p-1 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                          }`}
                        >
                          {(kanban[col.id] || []).map((story, idx) => (
                            <KanbanCard key={story.id} story={story} index={idx} canEdit={canEdit} onDelete={handleDelete} />
                          ))}
                          {provided.placeholder}
                          {(kanban[col.id] || []).length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-4 text-xs text-surface-300 dark:text-surface-600">Empty</div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        ) : view === 'list' ? (
          stories.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No stories found"
              description="Try adjusting your filters or create a new story."
              action={canCreate ? <Link to="/stories/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Story</Link> : null}
            />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th><th>Reporter</th><th>Status</th><th>Priority</th>
                    <th>Category</th><th>Deadline</th><th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map(s => (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/stories/${s.id}`} className="font-medium text-surface-800 dark:text-white hover:text-primary-500 transition text-sm">
                          {truncate(s.title, 55)}
                        </Link>
                      </td>
                      <td><span className="text-sm text-surface-500">{s.reporter_name || '—'}</span></td>
                      <td><StatusBadge status={s.status} /></td>
                      <td><PriorityBadge priority={s.priority} /></td>
                      <td><span className="text-xs text-surface-400">{s.category_name || '—'}</span></td>
                      <td>
                        <span className={`text-xs font-medium ${
                          isOverdue(s.deadline) ? 'text-red-500' : 'text-surface-400'
                        }`}>
                          {formatDate(s.deadline)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          {/* View */}
                          <Link
                            to={`/stories/${s.id}`}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 transition-all"
                            title="View Story"
                          >
                            <Eye size={14} />
                          </Link>
                          {/* Edit — admin/chief_editor only */}
                          {canEdit && (
                            <Link
                              to={`/stories/${s.id}/edit`}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="Edit Story"
                            >
                              <Pencil size={14} />
                            </Link>
                          )}
                          {/* Delete — admin only */}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(s.id, s.title)}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Delete Story"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Timeline view
          stories.length === 0 ? (
            <EmptyState icon={Activity} title="No stories" description="No stories match your current filters." />
          ) : (
            <div className="card p-6">
              <div className="space-y-0">
                {stories.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="timeline-item"
                  >
                    <div
                      className="timeline-dot"
                      style={{ backgroundColor: KANBAN_COLS.find(c => c.id === s.status)?.color || '#64748b' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="card p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/stories/${s.id}`}
                              className="font-semibold text-surface-800 dark:text-white hover:text-primary-500 text-sm transition"
                            >
                              {s.title}
                            </Link>
                            <p className="text-xs text-surface-400 mt-1">
                              {s.reporter_name || 'Unassigned'} &middot; {s.category_name || 'No category'} &middot; Due {formatDate(s.deadline)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <PriorityBadge priority={s.priority} />
                            <StatusBadge status={s.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </AppLayout>
  )
}
