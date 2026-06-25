import Sidebar from './Sidebar'
import Navbar from './Navbar'
import FirstLoginModal from '../common/FirstLoginModal'

export default function AppLayout({ children, title }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '24px', background: '#F8FAFC' }}>
          {children}
        </main>
      </div>
      {/* Shown automatically on first login if name is a placeholder */}
      <FirstLoginModal />
    </div>
  )
}
