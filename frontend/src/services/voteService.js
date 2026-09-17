import apiClient from '../api/client'

export const voteService = {
  // Cast a vote for a poll option (Authenticated)
  castVote: async (pollId, optionId) => {
    const response = await apiClient.post(`/polls/${pollId}/vote`, {
      optionId,
    })
    return response.data
  },

  // Get aggregated voting results
  getResults: async (pollId) => {
    const response = await apiClient.get(`/polls/${pollId}/results`)
    return response.data?.data
  },
}

export default voteService
