import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Trash2, Clock, User, Tag, MapPin, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { storiesAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatRelative, getStatusLabel, isOverdue } from '../../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_TRANSITIONS = {
  draft: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['submitted'],
  submitted: ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['published'],
  published: [],
  rejected: ['assigned'],
}

export default function StoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusComment, setStatusComment] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    storiesAPI.getById(id)
      .then(res => setStory(res.story))
      .catch(() => toast.error('Story not found'))
      .finally(() => setLoading(false))
  }, [id])

  const canEdit = ['admin', 'chief_editor', 'editor'].includes(user?.role)
  const canDelete = ['admin', 'chief_editor'].includes(user?.role)
  const isReporter = user?.role === 'reporter'

  const getNextStatuses = () => {
    if (!story) return []
    if (isReporter && story.reporter_id === user?.id) {
      // Reporter can only move their own story forward
      return STATUS_TRANSITIONS[story.status]?.filter(s => s === 'submitted' || s === 'in_progress') || []
    }
    return canEdit ? (STATUS_TRANSITIONS[story.status] || []) : []
  }

  const nextStatuses = getNextStatuses()

  const updateStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await storiesAPI.updateStatus(id, { status: newStatus, comment: statusComment })
      setStory(prev => ({ ...prev, status: newStatus }))
      setStatusComment('')
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`)
    } catch (e) {
      toast.error(e.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await storiesAPI.delete(id)
      toast.success('Story deleted')
      navigate('/stories')
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    }
  }

  if (loading) return <AppLayout title="Story Detail"><LoadingSpinner size="lg" /></AppLayout>
  if (!story) return (
    <AppLayout title="Not Found">
      <div className="text-center py-20">
        <p className="text-surface-400">Story not found</p>
        <button onClick={() => navigate('/stories')} className="btn btn-ghost btn-sm mt-4">Back to Stories</button>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Story Detail">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link to={`/stories/${id}/edit`} className="btn btn-outline btn-sm">
                <Edit2 size={14} /> Edit
              </Link>
            )}
            {canDelete && (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-sm">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Story header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <StatusBadge status={story.status} />
            <PriorityBadge priority={story.priority} />
            {isOverdue(story.deadline) && !['published', 'rejected'].includes(story.status) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <AlertTriangle size={10} /> Overdue
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-surface-800 dark:text-white mb-4 leading-tight">{story.title}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-surface-100 dark:border-surface-700">
            <div className="flex items-start gap-2">
              <User size={15} className="text-surface-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-surface-400">Reporter</p>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{story.reporter_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag size={15} className="text-surface-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-surface-400">Category</p>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{story.category_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={15} className="text-surface-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-surface-400">Deadline</p>
                <p className={`text-sm font-medium ${
                  isOverdue(story.deadline) ? 'text-red-500' : 'text-surface-700 dark:text-surface-300'
                }`}>{formatDate(story.deadline)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-surface-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-surface-400">Location</p>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{story.location || '—'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h3 className="font-bold text-surface-800 dark:text-white mb-3">Description</h3>
          <div className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed whitespace-pre-wrap">
            {story.description || 'No description provided.'}
          </div>
          {Array.isArray(story.tags) && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
              {story.tags.map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Status update panel */}
        {nextStatuses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h3 className="font-bold text-surface-800 dark:text-white mb-4">Update Status</h3>
            <textarea
              value={statusComment}
              onChange={e => setStatusComment(e.target.value)}
              placeholder="Add a comment for this status change (optional)..."
              className="input min-h-[80px] resize-none mb-4"
            />
            <div className="flex flex-wrap gap-3">
              {nextStatuses.map(ns => (
                <button
                  key={ns}
                  onClick={() => updateStatus(ns)}
                  disabled={updating}
                  className="btn btn-primary btn-sm"
                >
                  {updating && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                  Move to {getStatusLabel(ns)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activity timeline */}
        {story.updates?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
            <h3 className="font-bold text-surface-800 dark:text-white mb-5">Activity Timeline</h3>
            <div className="space-y-0">
              {story.updates.map((u) => (
                <div key={u.id} className="timeline-item">
                  <div className="timeline-dot bg-secondary-500">
                    <MessageSquare size={10} />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{u.user_name}</span>
                      <span className="text-xs text-surface-400">moved to</span>
                      <StatusBadge status={u.new_status} />
                      <span className="text-xs text-surface-400">{formatRelative(u.created_at)}</span>
                    </div>
                    {u.comment && (
                      <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 italic pl-1">'{u.comment}'</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Story"
        message="This action cannot be undone. The story and all its history will be permanently deleted."
        confirmLabel="Delete Story"
      />
    </AppLayout>
  )
}
