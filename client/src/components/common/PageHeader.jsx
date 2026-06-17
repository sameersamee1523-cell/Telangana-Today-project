import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between mb-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-surface-800 dark:text-white">{title}</h1>
        {subtitle && <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
