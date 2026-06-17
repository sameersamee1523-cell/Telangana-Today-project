import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Plus } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { storiesAPI, adminAPI, usersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent 🚨' },
]

const STATUSES = [
  'draft','assigned','in_progress','submitted','under_review','approved','published','rejected'
]

const EMPTY_FORM = {
  title: '', description: '', category_id: '', location: '',
  reporter_id: '', priority: 'medium', deadline: '', status: 'draft', tags: ''
}

export default function StoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = Boolean(id)
  const [categories, setCategories] = useState([])
  const [reporters, setReporters] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    adminAPI.getCategories().then(r => setCategories(r.categories || [])).catch(() => {})
    usersAPI.getReporters().then(r => setReporters(r.reporters || [])).catch(() => {})
    if (isEdit) {
      storiesAPI.getById(id)
        .then(r => {
          const s = r.story
          setForm({
            title: s.title || '',
            description: s.description || '',
            category_id: s.category_id || '',
            location: s.location || '',
            reporter_id: s.reporter_id || '',
            priority: s.priority || 'medium',
            deadline: s.deadline ? s.deadline.split('T')[0] : '',
            status: s.status || 'draft',
            tags: Array.isArray(s.tags) ? s.tags.join(', ') : (s.tags || '')
          })
        })
        .catch(() => toast.error('Failed to load story'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Story title is required'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        category_id: form.category_id || null,
        reporter_id: form.reporter_id || null,
        deadline: form.deadline || null,
      }
      if (isEdit) {
        await storiesAPI.update(id, payload)
        toast.success('Story updated successfully!')
        navigate(`/stories/${id}`)
      } else {
        const res = await storiesAPI.create(payload)
        toast.success('Story created successfully!')
        const newId = res.story?.id || res.id
        navigate(newId ? `/stories/${newId}` : '/stories')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save story')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <AppLayout title={isEdit ? 'Edit Story' : 'New Story'}><LoadingSpinner /></AppLayout>

  return (
    <AppLayout title={isEdit ? 'Edit Story' : 'New Story'}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-surface-800 dark:text-white">
            {isEdit ? 'Edit Story' : 'Create New Story'}
          </h1>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Story Details */}
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Story Details</h2>
            <div>
              <label className="label">Story Title <span className="text-red-500">*</span></label>
              <input
                name="title" value={form.title} onChange={handleChange}
                className="input" placeholder="Enter a compelling story title..." required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                className="input min-h-[120px] resize-y"
                placeholder="Describe the story angle, key points to cover, sources to interview..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} className="input">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  name="location" value={form.location} onChange={handleChange}
                  className="input" placeholder="Hyderabad, Telangana..."
                />
              </div>
            </div>
            <div>
              <label className="label">Tags <span className="text-surface-400 font-normal text-xs">(comma separated)</span></label>
              <input
                name="tags" value={form.tags} onChange={handleChange}
                className="input" placeholder="politics, budget, reform, 2024"
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Assignment & Workflow</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Assign Reporter</label>
                <select name="reporter_id" value={form.reporter_id} onChange={handleChange} className="input">
                  <option value="">Select a reporter</option>
                  {reporters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority Level</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="input">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Deadline</label>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input" />
              </div>
              {isEdit && (
                <div>
                  <label className="label">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="input">
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : isEdit ? <Save size={16} /> : <Plus size={16} />
              }
              {isEdit ? 'Update Story' : 'Create Story'}
            </button>
          </div>
        </motion.form>
      </div>
    </AppLayout>
  )
}
