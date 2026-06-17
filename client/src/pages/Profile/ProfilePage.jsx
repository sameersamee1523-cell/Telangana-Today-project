import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Building2, Camera, Save, Lock } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { authAPI, usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: user?.name || 'Ravi Kumar',
    email: user?.email || 'ravi@telanganatoday.com',
    phone: '+91 98765 43210',
    department: user?.department || 'Management',
    bio: 'Senior journalist with 10+ years of experience covering politics and governance in Telangana.',
  })

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })

  const handleSave = async () => {
    try {
      const res = await usersAPI.update(user.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio
      })
      updateUser(res.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success('Profile updated successfully')
    } catch(err) {
      toast.error(err.message || 'Failed to update profile')
    }
  }

  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Please fill in all password fields')
      return
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    try {
      await authAPI.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      })
      toast.success('Password updated successfully')
      setPasswords({ current: '', newPass: '', confirm: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    }
  }

  return (
    <AppLayout title="Profile">
      <PageHeader title="My Profile" subtitle="Manage your personal information and account settings" />

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm mb-6 flex items-center gap-6"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {form.name.charAt(0)}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-800 dark:text-white">{form.name}</h2>
          <p className="text-sm text-surface-500 capitalize">{user?.role?.replace('_', ' ') || 'Admin'} · {form.department}</p>
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

      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: 'Full Name', key: 'name', icon: User },
              { label: 'Email Address', key: 'email', icon: Mail },
              { label: 'Phone Number', key: 'phone', icon: Phone },
              { label: 'Department', key: 'department', icon: Building2 },
            ].map(({ label, key, icon: Icon }) => (
              <div key={key}>
                <label className="text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                  <Icon size={12} /> {label}
                </label>
                <input
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm max-w-md"
        >
          <h3 className="font-semibold text-surface-800 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={16} className="text-indigo-500" /> Change Password
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newPass' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-medium text-surface-500 mb-1.5 block">{label}</label>
                <input type="password" value={passwords[key]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            ))}
          </div>
          <button onClick={handlePasswordUpdate}
            className={`mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Save size={15} /> {saved ? 'Updated!' : 'Update Password'}
          </button>
        </motion.div>
      )}
    </AppLayout>
  )
}
