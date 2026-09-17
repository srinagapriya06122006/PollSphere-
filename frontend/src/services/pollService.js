import apiClient from '../api/client'

export const pollService = {
  // List polls with pagination and optional status filter
  getPolls: async (page = 1, limit = 9, status = '') => {
    let url = `/polls?page=${page}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await apiClient.get(url)
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

  // Update a poll (Authenticated - Owner only)
  updatePoll: async (id, updateData) => {
    const response = await apiClient.put(`/polls/${id}`, updateData)
    return response.data?.data
  },

  // Delete a poll (Authenticated - Owner only)
  deletePoll: async (id) => {
    const response = await apiClient.delete(`/polls/${id}`)
    return response.data
  },
}

export default pollService
