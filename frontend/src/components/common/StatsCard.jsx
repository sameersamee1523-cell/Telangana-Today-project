import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatsCard({ title, value, icon: Icon, color = '#E11D48', trend, trendValue, subtitle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">{title}</p>
          <p
            className="text-4xl font-black leading-none"
            style={{ color: '#0F172A', letterSpacing: '-0.03em' }}
          >
            {value ?? '—'}
          </p>
          {subtitle && (
            <p className="text-xs text-surface-400 mt-2">{subtitle}</p>
          )}
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-2.5 text-xs font-semibold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trendValue}% vs last month</span>
            </div>
          )}
        </div>
        <div
          className="w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0 ml-4"
          style={{
            backgroundColor: color + '15',
            border: `1.5px solid ${color}25`,
            color,
            width: 52,
            height: 52,
          }}
        >
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  )
}
