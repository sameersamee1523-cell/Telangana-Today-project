import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      })
      newSocket.on('connect', () => setConnected(true))
      newSocket.on('disconnect', () => setConnected(false))
      setSocket(newSocket)
      return () => { newSocket.close(); setConnected(false) }
    }
  }, [user, token])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
