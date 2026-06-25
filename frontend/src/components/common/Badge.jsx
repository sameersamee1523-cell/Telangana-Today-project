import { getStatusLabel } from '../../utils/helpers'

const VARIANT_CLASSES = {
  red:    'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  green:  'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  teal:   'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default function Badge({ variant = 'gray', children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.gray}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const classes = {
    draft:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    assigned:     'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    in_progress:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    submitted:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    under_review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    approved:     'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
    published:    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    rejected:     'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  }[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {getStatusLabel(status)}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const classes = {
    low:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
    high:   'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  }[priority] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes} ${priority === 'urgent' ? 'animate-pulse' : ''}`}>
      {priority === 'urgent' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  )
}

export function RoleBadge({ role }) {
  const classes = {
    admin:        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    chief_editor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    editor:       'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    reporter:     'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  }[role] || 'bg-gray-100 text-gray-600'
  const labels = { admin: 'Admin', chief_editor: 'Chief Editor', editor: 'Editor', reporter: 'Reporter' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {labels[role] || role}
    </span>
  )
}
