import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, CheckCircle, Newspaper } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

/**
 * FirstLoginModal
 * Shown automatically after login if the user has never set a proper name
 * (i.e. name starts with "New " or matches a placeholder pattern).
 */

const PLACEHOLDER_PATTERNS = [
  /^new /i, /^admin$/i, /^reporter$/i, /^editor$/i,
  /^chief editor$/i, /^user$/i, /^test/i
]

function isPlaceholderName(name) {
  if (!name) return true
  return PLACEHOLDER_PATTERNS.some(p => p.test(name.trim()))
}

export default function FirstLoginModal() {
  const { user, updateUser } = useAuth()
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    // Show modal if user's name is a placeholder
    if (user && isPlaceholderName(user.name)) {
      setOpen(true)
      setName('')
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) {
      toast.error('Please enter your full name')
      return
    }
    if (isPlaceholderName(trimmed)) {
      toast.error('Please enter your real name, not a role title')
      return
    }
    setSaving(true)
    try {
      const res = await usersAPI.update(user.id, { name: trimmed })
      updateUser(res.user)
      setDone(true)
      toast.success(`Welcome, ${trimmed}! 🎉`)
      setTimeout(() => setOpen(false), 1400)
    } catch (err) {
      toast.error(err.message || 'Failed to save name')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(11,19,43,0.75)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 25px 80px rgba(0,0,0,0.25)' }}
        >
          {/* Top gradient bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E11D48 0%, #3B82F6 100%)' }} />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0B132B 0%, #1a2545 100%)' }}>
              <Newspaper size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-surface-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
              Welcome to the Newsroom!
            </h2>
            <p className="text-sm text-surface-400">
              Before you begin, please tell us your full name so your colleagues know who you are.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            {done ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-4 gap-3"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: '#ECFDF5' }}>
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <p className="font-bold text-surface-800">All set, {name}!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">
                    Your Full Name <span className="text-primary-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input pl-10"
                      placeholder="e.g. Arjun Reddy"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-surface-400 mt-1.5">
                    Enter your real first and last name — this appears on all your stories.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="btn btn-primary w-full"
                  style={{ marginTop: 8 }}
                >
                  {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Save My Name & Enter Dashboard'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
