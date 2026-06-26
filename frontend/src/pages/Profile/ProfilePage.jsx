import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Building2, Save, Lock, Eye, EyeOff, BadgeCheck } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { authAPI, usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  admin:        'Admin',
  chief_editor: 'Chief Editor',
  editor:       'Editor',
  reporter:     'Reporter',
  photographer: 'Photographer',
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab]         = useState('profile')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  // Profile form — initialized from real auth user data
  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio:   user?.bio   || '',
  })

  // Load fresh user data on mount
  useEffect(() => {
    authAPI.getMe().then(res => {
      const u = res.user
      setForm({
        name:  u.name  || '',
        email: u.email || '',
        phone: u.phone || '',
        bio:   u.bio   || '',
      })
      updateUser(u)
    }).catch(() => {})
  }, [])

  // Password fields
  const [passwords, setPasswords]     = useState({ current: '', newPass: '', confirm: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdSaving, setPwdSaving]     = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      const res = await usersAPI.update(user.id, {
        name:  form.name.trim(),
        phone: form.phone,
        bio:   form.bio,
      })
      updateUser(res.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Please fill in all password fields')
      return
    }
    if (passwords.newPass.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setPwdSaving(true)
    try {
      await authAPI.updatePassword({
        currentPassword: passwords.current,
        newPassword:     passwords.newPass
      })
      toast.success('✅ Password changed successfully!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setPwdSaving(false)
    }
  }

  const initials = (form.name || user?.name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <AppLayout title="Profile">
      <PageHeader title="My Profile" subtitle="Manage your personal information and account settings" />

      {/* Avatar + Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm mb-6 flex items-center gap-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold select-none">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-800 dark:text-white">{form.name || user?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-surface-500 capitalize">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            {user?.department_name && (
              <>
                <span className="text-surface-300">·</span>
                <span className="text-sm text-surface-500">{user.department_name}</span>
              </>
            )}
          </div>
          <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
            <BadgeCheck size={12} className="text-emerald-500" /> {user?.email}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? 'bg-white dark:bg-surface-900 text-surface-800 dark:text-white shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                <User size={12} /> Full Name
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>

            {/* Email — read only */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                <Mail size={12} /> Email Address <span className="text-[10px] text-surface-400 ml-1">(contact admin to change)</span>
              </label>
              <input
                value={form.email}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-sm text-surface-500 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                <Phone size={12} /> Phone Number
              </label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>

            {/* Department — read only */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                <Building2 size={12} /> Department
              </label>
              <input
                value={user?.department_name || 'Not assigned'}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-sm text-surface-500 cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Bio</label>
              <textarea rows={3} value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Write a short bio about yourself..."
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                saved ? 'bg-green-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <Save size={15} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm max-w-md"
        >
          <h3 className="font-semibold text-surface-800 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={16} className="text-primary-500" /> Change Password
          </h3>
          <div className="space-y-4">

            {/* Current Password */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwords.newPass}
                  onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwords.confirm && passwords.newPass !== passwords.confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <button
            onClick={handlePasswordUpdate}
            disabled={pwdSaving}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-50"
          >
            <Lock size={15} /> {pwdSaving ? 'Updating...' : 'Update Password'}
          </button>
        </motion.div>
      )}
    </AppLayout>
  )
}
