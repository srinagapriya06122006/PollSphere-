import apiClient from '../api/client'

export const pollService = {
  // List polls with pagination, search, category, status, and sorting filters
  getPolls: async (page = 1, limit = 9, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (typeof filters === 'string') {
      if (filters) params.append('status', filters)
    } else {
      if (filters.status) params.append('status', filters.status)
      if (filters.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.creatorId) params.append('creator_id', filters.creatorId)
    }

    const response = await apiClient.get(`/polls?${params.toString()}`)
    return response.data?.data
  },

  // Get a single poll by ID
  getPollById: async (id) => {
    const response = await apiClient.get(`/polls/${id}`)
    return response.data?.data
  },

  // Create a new poll (Authenticated)
  createPoll: async (pollData) => {
    const response = await apiClient.post('/polls', pollData)
    return response.data?.data
  },

  // Update a poll (Authenticated - Owner or Admin)
  updatePoll: async (id, updateData) => {
    const response = await apiClient.put(`/polls/${id}`, updateData)
    return response.data?.data
  },

  // Delete a poll (Authenticated - Owner or Admin)
  deletePoll: async (id) => {
    const response = await apiClient.delete(`/polls/${id}`)
    return response.data
  },

  // Clone / Duplicate a poll (Authenticated)
  clonePoll: async (id) => {
    const response = await apiClient.post(`/polls/${id}/clone`)
    return response.data?.data
  },
}

export default pollService
