import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns'

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return 'N/A'
  try { return format(typeof date === 'string' ? parseISO(date) : date, fmt) }
  catch { return 'N/A' }
}

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm')

export const formatRelative = (date) => {
  if (!date) return ''
  try { return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true }) }
  catch { return '' }
}

export const isOverdue = (deadline) => {
  if (!deadline) return false
  return isAfter(new Date(), typeof deadline === 'string' ? parseISO(deadline) : deadline)
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const getStatusLabel = (status) => ({
  draft: 'Draft', assigned: 'Assigned', in_progress: 'In Progress',
  submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', published: 'Published', rejected: 'Rejected'
}[status] || status)

export const getStatusColor = (status) => ({
  draft: 'neutral', assigned: 'info', in_progress: 'secondary',
  submitted: 'warning', under_review: 'warning', approved: 'success',
  published: 'success', rejected: 'danger'
}[status] || 'neutral')

export const getPriorityColor = (priority) => ({
  low: '#64748b', medium: '#3b82f6', high: '#f97316', urgent: '#ef4444'
}[priority] || '#64748b')

export const getRoleLabel = (role) => ({
  admin: 'Admin', chief_editor: 'Chief Editor', editor: 'Editor', reporter: 'Reporter'
}[role] || role)

export const getRoleBadgeClass = (role) => ({
  admin: 'badge-danger', chief_editor: 'badge-primary', editor: 'badge-secondary', reporter: 'badge-success'
}[role] || 'badge-neutral')

export const truncate = (str, max = 80) => str && str.length > max ? str.slice(0, max) + '...' : str

export const classNames = (...classes) => classes.filter(Boolean).join(' ')

export const STORY_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
]

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]
