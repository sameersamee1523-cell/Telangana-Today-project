import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import newsroomBg from '../assets/newsroom_bg.png'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please provide your email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { loginId: email })
      setSuccess(true)
      toast.success('Reset link sent if the account exists')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${newsroomBg})` }}
      />
      <div className="absolute inset-0 z-0 bg-surface-950/80 backdrop-blur-sm" />

      {/* Form Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/10 dark:bg-surface-900/40 backdrop-blur-xl border border-white/20 dark:border-surface-700 p-8 rounded-3xl shadow-2xl"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-primary">
              <Newspaper size={28} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">Reset Password</h1>
            <p className="text-surface-300 text-sm">
              Enter your Employee ID or Official Email to receive a reset link.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/20 text-red-200 text-sm mb-6 border border-red-500/30"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Check your email</h2>
              <p className="text-surface-300 text-sm mb-8">
                If an account matches, we've sent a password reset link to your registered official email address.
              </p>
              <Link to="/login" className="btn btn-primary w-full btn-lg">
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label text-surface-200">Official Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    className="input pl-10 bg-white/5 border-white/10 text-white placeholder:text-surface-400 focus:bg-white/10"
                    placeholder="you@telanganatoday.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              ← Back to login
            </Link>
          </div>
          
          <div className="mt-12 text-center text-xs text-surface-400">
            © 2026 Telangana Today Editorial Management System
          </div>
        </motion.div>
      </div>
    </div>
  )
}
