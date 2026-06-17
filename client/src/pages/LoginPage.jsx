import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }




  const LEFT_FEATURES = [
    'Story Assignment & Tracking',
    'Real-time Notifications',
    'Analytics & Reports',
    'Role-Based Access Control',
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-dark relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-950 to-black" />
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-12 max-w-md w-full">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-primary">
              <Newspaper size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Telangana Today</p>
              <p className="text-sm text-surface-400">Pipeline Manager</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Editorial Workflow<br />
            <span className="gradient-text">Made Effortless</span>
          </h2>
          <p className="text-surface-400 mb-10 leading-relaxed">
            The central hub for story assignment, tracking, and publication — built for modern newsrooms.
          </p>

          <div className="space-y-4">
            {LEFT_FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                </div>
                <span className="text-sm text-surface-300">{f}</span>
              </motion.div>
            ))}
          </div>

          {/* Floating stat cards */}
          <div className="mt-12 grid grid-cols-2 gap-3">
            {[
              { label: 'Stories Tracked', val: '248+', color: '#E11D48' },
              { label: 'Active Reporters', val: '12', color: '#2563EB' },
              { label: 'Published Today', val: '18', color: '#22c55e' },
              { label: 'Avg. Turnaround', val: '4.2h', color: '#f97316' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-surface-400 mb-1">{stat.label}</p>
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-8 bg-white dark:bg-surface-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Newspaper size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-surface-800 dark:text-white">Telangana Today</p>
              <p className="text-xs text-surface-400">Pipeline Manager</p>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-surface-800 dark:text-white mb-1">Welcome back</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-8">
            Sign in to your editorial dashboard
          </p>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm mb-6 border border-red-100 dark:border-red-900"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="you@telanganatoday.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>





          {/* Back to home */}
          <p className="text-center text-xs text-surface-400 mt-6">
            <Link to="/" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
