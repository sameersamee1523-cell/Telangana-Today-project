import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Search, Edit2, Trash2, User, Eye, Lock } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  admin: 'red', chief_editor: 'purple', editor: 'indigo', reporter: 'green'
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  
  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    role: 'reporter',
    department_id: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getAll({ limit: 100 }) // Adjust limit if needed
      setUsers(res.users)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      await usersAPI.create(addForm)
      toast.success('User added successfully')
      setIsAddModalOpen(false)
      setAddForm({ name: '', email: '', password: 'Password@123', role: 'reporter', department_id: '' })
      fetchUsers() // Refresh list
    } catch (err) {
      toast.error(err.message || 'Failed to add user')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      await usersAPI.delete(deleteTarget.id)
      toast.success('User deleted successfully')
      setUsers(u => u.filter(x => x.id !== deleteTarget.id))
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    } finally {
      setDeleteTarget(null)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <AppLayout title="Users">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout title="Users">
      <PageHeader
        title="User Management"
        subtitle="Manage reporters, editors, and administrators"
        action={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <UserPlus size={16} /> Add User
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Name</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Email</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Role</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Department</th>
              <th className="text-left px-6 py-3 text-surface-500 font-medium">Status</th>
              <th className="text-right px-6 py-3 text-surface-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium text-surface-800 dark:text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-surface-500">{user.email}</td>
                <td className="px-6 py-4">
                  <Badge variant={ROLE_COLORS[user.role] || 'gray'}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{user.department_name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active === 1
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active === 1 ? 'bg-green-500' : 'bg-surface-400'}`} />
                    {user.is_active === 1 ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-indigo-500 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-surface-400">No users found.</div>
        )}
      </motion.div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isAdding && setIsAddModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUser} className="space-y-4 w-full md:w-[400px]">
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">Full Name</label>
            <input
              required
              type="text"
              value={addForm.name}
              onChange={e => setAddForm({...addForm, name: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">Email Address</label>
            <input
              required
              type="email"
              value={addForm.email}
              onChange={e => setAddForm({...addForm, email: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. john.doe@gmail.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">Initial Password</label>
            <input
              required
              type="text"
              value={addForm.password}
              onChange={e => setAddForm({...addForm, password: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Password@123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Role</label>
              <select
                value={addForm.role}
                onChange={e => setAddForm({...addForm, role: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="reporter">Reporter</option>
                <option value="editor">Editor</option>
                <option value="chief_editor">Chief Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">Dept ID (Optional)</label>
              <input
                type="number"
                min="1"
                value={addForm.department_id}
                onChange={e => setAddForm({...addForm, department_id: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 1"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
