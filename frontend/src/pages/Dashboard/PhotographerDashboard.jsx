import { Newspaper } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

export default function PhotographerDashboard({ title = 'Photographer Dashboard' }) {
  return (
    <AppLayout title={title}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 border border-surface-200 dark:border-surface-800 flex flex-col items-center justify-center text-center">
          <Newspaper className="w-16 h-16 text-primary-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Welcome to your Dashboard</h2>
          <p className="text-surface-500 max-w-md">
            View your photo assignments and upload story attachments here.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
