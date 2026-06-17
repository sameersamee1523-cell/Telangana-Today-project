import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatsCard({ title, value, icon: Icon, color = '#E11D48', trend, trendValue, subtitle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-surface-800 dark:text-white mt-2">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trendValue}% from last month</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
          style={{ backgroundColor: color + '20', color }}
        >
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  )
}
