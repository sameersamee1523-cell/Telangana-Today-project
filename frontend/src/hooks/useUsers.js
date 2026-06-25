import { useState, useCallback } from 'react'
import { usersAPI } from '../services/api'
import toast from 'react-hot-toast'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [reporters, setReporters] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const data = await usersAPI.getAll(params)
      setUsers(data.users || [])
      return data
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReporters = useCallback(async () => {
    try {
      const data = await usersAPI.getReporters()
      setReporters(data.reporters || [])
    } catch {}
  }, [])

  const createUser = async (data) => {
    const result = await usersAPI.create(data)
    toast.success('User created!')
    return result
  }

  const updateUser = async (id, data) => {
    const result = await usersAPI.update(id, data)
    toast.success('User updated!')
    return result
  }

  const deleteUser = async (id) => {
    await usersAPI.delete(id)
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success('User deactivated')
  }

  return { users, reporters, loading, fetchUsers, fetchReporters, createUser, updateUser, deleteUser, setUsers }
}
