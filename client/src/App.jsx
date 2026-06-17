import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import { NotificationProvider } from './context/NotificationContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import EditorDashboard from './pages/Dashboard/EditorDashboard'
import ReporterDashboard from './pages/Dashboard/ReporterDashboard'
import StoriesPage from './pages/Stories/StoriesPage'
import StoryDetailPage from './pages/Stories/StoryDetailPage'
import StoryFormPage from './pages/Stories/StoryFormPage'
import AnalyticsPage from './pages/Analytics/AnalyticsPage'
import ReportsPage from './pages/Reports/ReportsPage'
import UsersPage from './pages/Admin/UsersPage'
import AuditLogsPage from './pages/Admin/AuditLogsPage'
import CategoriesPage from './pages/Admin/CategoriesPage'
import DepartmentsPage from './pages/Admin/DepartmentsPage'
import ProfilePage from './pages/Profile/ProfilePage'
import SettingsPage from './pages/Settings/SettingsPage'
import LoadingSpinner from './components/common/LoadingSpinner'

function DashboardRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <AdminDashboard />
  if (user.role === 'chief_editor') return <AdminDashboard />
  if (user.role === 'editor') return <EditorDashboard />
  return <ReporterDashboard />
}

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
      <Route path="/stories" element={<PrivateRoute><StoriesPage /></PrivateRoute>} />
      <Route path="/stories/new" element={<PrivateRoute roles={['admin','chief_editor','editor']}><StoryFormPage /></PrivateRoute>} />
      <Route path="/stories/:id" element={<PrivateRoute><StoryDetailPage /></PrivateRoute>} />
      <Route path="/stories/:id/edit" element={<PrivateRoute roles={['admin','chief_editor','editor']}><StoryFormPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute roles={['admin','chief_editor','editor']}><AnalyticsPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={['admin','chief_editor','editor']}><ReportsPage /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin','chief_editor']}><UsersPage /></PrivateRoute>} />
      <Route path="/admin/audit-logs" element={<PrivateRoute roles={['admin']}><AuditLogsPage /></PrivateRoute>} />
      <Route path="/admin/categories" element={<PrivateRoute roles={['admin']}><CategoriesPage /></PrivateRoute>} />
      <Route path="/admin/departments" element={<PrivateRoute roles={['admin']}><DepartmentsPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { borderRadius: '12px', fontFamily: 'Inter', fontSize: '14px' },
                  success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#E11D48', secondary: '#fff' } },
                }}
              />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}
