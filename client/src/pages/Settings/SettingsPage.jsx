import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Sun, Globe, Shield, Palette, Save, Monitor } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { useTheme } from '../../context/ThemeContext'

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-surface-300 dark:bg-surface-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme?.() || { theme: 'dark', setTheme: () => {} }
  const [saved, setSaved] = useState(false)

  const [notifications, setNotifications] = useState({
    storyAssigned: true, storyApproved: true, storyRejected: true,
    deadlineReminder: true, systemAlerts: false, emailDigest: false,
  })

  const [prefs, setPrefs] = useState({
    language: 'English', timezone: 'Asia/Kolkata', compactView: false,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <AppLayout title="Settings">
      <PageHeader title="Settings" subtitle="Customize your experience and notification preferences" />

      <div className="space-y-6 max-w-2xl">

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm"
        >
          <h3 className="font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
            <Palette size={16} className="text-indigo-500" /> Appearance
          </h3>
          <div className="flex gap-3">
            {themes.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTheme(id)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  theme === id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300 dark:hover:border-surface-600'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm"
        >
          <h3 className="font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={16} className="text-indigo-500" /> Notifications
          </h3>
          <div className="space-y-4">
            {Object.entries({
              storyAssigned: 'Story assigned to me',
              storyApproved: 'Story approved',
              storyRejected: 'Story rejected / returned',
              deadlineReminder: 'Deadline reminders',
              systemAlerts: 'System alerts',
              emailDigest: 'Daily email digest',
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-surface-700 dark:text-surface-300">{label}</span>
                <Toggle
                  enabled={notifications[key]}
                  onChange={v => setNotifications(n => ({ ...n, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm"
        >
          <h3 className="font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={16} className="text-indigo-500" /> Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Language</label>
              <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>English</option>
                <option>Telugu</option>
                <option>Hindi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Timezone</label>
              <select value={prefs.timezone} onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-700 dark:text-surface-300">Compact view</span>
              <Toggle enabled={prefs.compactView} onChange={v => setPrefs(p => ({ ...p, compactView: v }))} />
            </div>
          </div>
        </motion.div>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Save size={15} /> {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
