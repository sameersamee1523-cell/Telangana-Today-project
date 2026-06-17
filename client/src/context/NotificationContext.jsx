import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'
import axios from 'axios'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { socket } = useSocket() || {}
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await axios.get('http://localhost:5000/api/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch {}
  }, [user])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    if (!socket) return
    const handler = (notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    }
    socket.on('notification:new', handler)
    return () => socket.off('notification:new', handler)
  }, [socket])

  const markRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await axios.patch('http://localhost:5000/api/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
