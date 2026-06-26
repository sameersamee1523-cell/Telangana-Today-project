import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Search, Edit2, Trash2, User, Eye, EyeOff, KeyRound, X, Check, ShieldCheck } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { usersAPI, adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  admin: 'red', chief_editor: 'purple', editor: 'indigo', reporter: 'green', photographer: 'yellow'
}

const ROLE_OPTIONS = [
  { value: 'reporter',     label: 'Reporter' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'editor',       label: 'Editor' },
  { value: 'chief_editor', label: 'Chief Editor' },
  { value: 'admin',        label: 'Admin' },
]

const FORBIDDEN_NAMES = [
  'new reporter', 'new admin', 'new editor', 'new chief editor',
  'reporter', 'admin', 'editor', 'chief editor', 'test', 'test user',
  'user', 'new user', 'sample', 'sample user'
]

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const isAdmin = ['admin', 'chief_editor'].includes(currentUser?.role)

  const [loading, setLoading]           = useState(true)
  const [users, setUsers]               = useState([])
  const [departments, setDepartments]   = useState([])
  const [search, setSearch]             = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Add User ────────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen]   = useState(false)
  const [isAdding, setIsAdding]     = useState(false)
  const [showAddPwd, setShowAddPwd] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '', email: '', password: 'Password@123', role: 'reporter', department_id: ''
  })

  // ── Edit User ───────────────────────────────────────────────────
  const [editTarget, setEditTarget]   = useState(null)
  const [isEditOpen, setIsEditOpen]   = useState(false)
  const [isEditing, setIsEditing]     = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', department_id: '' })

  // ── Reset Password ──────────────────────────────────────────────
  const [resetTarget, setResetTarget]     = useState(null)
  const [isResetOpen, setIsResetOpen]     = useState(false)
  const [isResetting, setIsResetting]     = useState(false)
  const [showResetPwd, setShowResetPwd]   = useState(false)
  const [newPassword, setNewPassword]     = useState('')

  // ── Load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers()
    adminAPI.getDepartments().then(r => setDepartments(r.departments || [])).catch(() => {})
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getAll({ limit: 100 })
      setUsers(res.users)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // ── Add User ─────────────────────────────────────────────────────
  const handleAddUser = async (e) => {
    e.preventDefault()
    const trimmedName = addForm.name.trim()
    if (!trimmedName) { toast.error('Please enter the user\'s full name'); return }
    if (FORBIDDEN_NAMES.includes(trimmedName.toLowerCase())) {
      toast.error('Please enter the person\'s actual full name (e.g. "Arjun Reddy"), not a role or placeholder.')
      return
    }
    if (addForm.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setIsAdding(true)
    try {
      await usersAPI.create({ ...addForm, name: trimmedName })
      toast.success(`✅ Account created for "${trimmedName}"`)
      setIsAddOpen(false)
      setAddForm({ name: '', email: '', password: 'Password@123', role: 'reporter', department_id: '' })
      setShowAddPwd(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.message || 'Failed to add user')
    } finally {
      setIsAdding(false)
    }
  }

  // ── Edit User ─────────────────────────────────────────────────────
  const openEdit = (user) => {
    setEditTarget(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, department_id: user.department_id || '' })
    setIsEditOpen(true)
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!editForm.name.trim()) { toast.error('Name cannot be empty'); return }
    setIsEditing(true)
    try {
      await usersAPI.update(editTarget.id, editForm)
      toast.success('User updated successfully')
      setIsEditOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.message || 'Failed to update user')
    } finally {
      setIsEditing(false)
    }
  }

  // ── Reset Password ────────────────────────────────────────────────
  const openReset = (user) => {
    setResetTarget(user)
    setNewPassword('')
    setShowResetPwd(false)
    setIsResetOpen(true)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setIsResetting(true)
    try {
      await usersAPI.resetPassword(resetTarget.id, newPassword)
      toast.success(`🔑 Password reset for "${resetTarget.name}"`)
      setIsResetOpen(false)
      setNewPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setIsResetting(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────
  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      await usersAPI.delete(deleteTarget.id)
      toast.success('User deactivated successfully')
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
        subtitle="Create and manage reporter, editor, and admin accounts"
        action={
          isAdmin && (
            <button onClick={() => setIsAddOpen(true)} className="btn btn-primary btn-sm">
              <UserPlus size={15} /> Create Account
            </button>
          )
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="card-plain overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-500">Name</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-500">Email</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-500">Role</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-500">Department</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-500">Status</th>
              {isAdmin && (
                <th className="text-right px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                style={{ borderBottom: '1px solid #F8FAFC' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFFBFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)' }}>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="font-semibold text-surface-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-surface-500 text-sm">{user.email}</td>
                <td className="px-6 py-4">
                  <Badge variant={ROLE_COLORS[user.role] || 'gray'}>
                    {user.role.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-surface-500 text-sm">{user.department_name || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user.is_active === 1
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-surface-100 text-surface-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active === 1 ? 'bg-emerald-500' : 'bg-surface-400'}`} />
                    {user.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Reset Password */}
                      <button
                        onClick={() => openReset(user)}
                        className="p-1.5 rounded-lg transition-colors text-surface-400 hover:text-amber-500"
                        onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        title="Reset password"
                      >
                        <KeyRound size={14} />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg transition-colors text-surface-400 hover:text-primary-500"
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        title="Edit user"
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="p-1.5 rounded-lg transition-colors text-surface-400 hover:text-red-500"
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF1F3'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        title="Deactivate user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <User size={32} className="text-surface-200 mx-auto mb-3" />
            <p className="text-sm text-surface-400">No users found.</p>
          </div>
        )}
      </motion.div>

      {/* ── Create Account Modal ── */}
      <Modal isOpen={isAddOpen} onClose={() => !isAdding && setIsAddOpen(false)} title="Create New Account">
        <form onSubmit={handleAddUser} className="space-y-4 w-full md:w-[420px]">

          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <ShieldCheck size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              The person will log in at <strong>telangana-today.vercel.app</strong> using their email and the password you set here.
              They can change their password from their Profile page after logging in.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="label">Full Name <span className="text-primary-500">*</span></label>
            <input
              required
              type="text"
              value={addForm.name}
              onChange={e => setAddForm({ ...addForm, name: e.target.value })}
              className="input"
              placeholder="e.g. Arjun Reddy"
              autoFocus
            />
            <p className="text-[11px] text-surface-400 mt-1">Enter the person's real name, not their role.</p>
          </div>

          {/* Email */}
          <div>
            <label className="label">Email (Gmail or work email) <span className="text-primary-500">*</span></label>
            <input
              required
              type="email"
              value={addForm.email}
              onChange={e => setAddForm({ ...addForm, email: e.target.value })}
              className="input"
              placeholder="e.g. arjun.reddy@gmail.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">Initial Password <span className="text-primary-500">*</span></label>
            <div className="relative">
              <input
                required
                type={showAddPwd ? 'text' : 'password'}
                value={addForm.password}
                onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                className="input pr-10"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowAddPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showAddPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-surface-400 mt-1">Share this password with the user. They can change it after login.</p>
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select
                value={addForm.role}
                onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                className="input"
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select
                value={addForm.department_id}
                onChange={e => setAddForm({ ...addForm, department_id: e.target.value })}
                className="input"
              >
                <option value="">— No department —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-ghost" disabled={isAdding}>
              Cancel
            </button>
            <button type="submit" disabled={isAdding} className="btn btn-primary">
              {isAdding
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span>
                : <span className="flex items-center gap-2"><UserPlus size={15} /> Create Account</span>
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit User Modal ── */}
      <Modal isOpen={isEditOpen} onClose={() => !isEditing && setIsEditOpen(false)} title={`Edit: ${editTarget?.name}`}>
        <form onSubmit={handleEditUser} className="space-y-4 w-full md:w-[400px]">
          <div>
            <label className="label">Full Name <span className="text-primary-500">*</span></label>
            <input
              required type="text"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="input" placeholder="Enter full name" autoFocus
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              className="input" placeholder="Enter email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                className="input"
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select
                value={editForm.department_id}
                onChange={e => setEditForm({ ...editForm, department_id: e.target.value })}
                className="input"
              >
                <option value="">— No department —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={isEditing} className="btn btn-primary">
              <Check size={14} /> {isEditing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Reset Password Modal ── */}
      <Modal isOpen={isResetOpen} onClose={() => !isResetting && setIsResetOpen(false)} title={`Reset Password: ${resetTarget?.name}`}>
        <form onSubmit={handleResetPassword} className="space-y-4 w-full md:w-[380px]">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <KeyRound size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              You are resetting the password for <strong>{resetTarget?.name}</strong>.
              Share the new password with them directly.
            </p>
          </div>
          <div>
            <label className="label">New Password <span className="text-primary-500">*</span></label>
            <div className="relative">
              <input
                required
                type={showResetPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input pr-10"
                placeholder="Min 8 characters"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowResetPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showResetPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsResetOpen(false)} className="btn btn-ghost" disabled={isResetting}>Cancel</button>
            <button type="submit" disabled={isResetting} className="btn btn-primary" style={{ background: '#D97706' }}>
              {isResetting
                ? 'Resetting...'
                : <span className="flex items-center gap-2"><KeyRound size={14} /> Reset Password</span>
              }
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"? They will no longer be able to log in.`}
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
