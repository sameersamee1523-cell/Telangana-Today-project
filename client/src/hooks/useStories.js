import { useState, useCallback } from 'react'
import { storiesAPI } from '../services/api'
import toast from 'react-hot-toast'

export function useStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStories = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await storiesAPI.getAll(params)
      setStories(data.stories || [])
      return data
    } catch (err) {
      setError(err.message || 'Failed to fetch stories')
      toast.error('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }, [])

  const createStory = async (data) => {
    const result = await storiesAPI.create(data)
    toast.success('Story created successfully!')
    return result
  }

  const updateStory = async (id, data) => {
    const result = await storiesAPI.update(id, data)
    toast.success('Story updated!')
    return result
  }

  const deleteStory = async (id) => {
    await storiesAPI.delete(id)
    setStories(prev => prev.filter(s => s.id !== id))
    toast.success('Story deleted')
  }

  const updateStatus = async (id, status, comment = '') => {
    const result = await storiesAPI.updateStatus(id, { status, comment })
    toast.success(`Status updated to ${getStatusLabel(status)}`)
    return result
  }

  return { stories, loading, error, fetchStories, createStory, updateStory, deleteStory, updateStatus, setStories }
}

function getStatusLabel(status) {
  return ({
    draft: 'Draft', assigned: 'Assigned', in_progress: 'In Progress',
    submitted: 'Submitted', under_review: 'Under Review',
    approved: 'Approved', published: 'Published', rejected: 'Rejected'
  }[status] || status)
}
