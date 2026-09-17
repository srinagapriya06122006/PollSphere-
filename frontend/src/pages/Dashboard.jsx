import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BarChart3, Filter } from 'lucide-react'
import pollService from '../services/pollService'
import PollCard from '../components/poll/PollCard'
import Pagination from '../components/poll/Pagination'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

export const Dashboard = () => {
  const [polls, setPolls] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPolls = async (targetPage = page, status = statusFilter) => {
    setLoading(true)
    setError(null)
    try {
      const data = await pollService.getPolls(targetPage, 6, status)
      setPolls(data?.polls || [])
      setTotal(data?.total || 0)
      setTotalPages(data?.total_pages || 1)
      setPage(data?.page || 1)
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch active polls')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls(page, statusFilter)
  }, [page, statusFilter])

  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/30 p-8 sm:p-10 shadow-2xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Polling Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create polls and gather insights in <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">real time</span>.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            High-concurrency Go backend with MongoDB persistence, Redis caching, and instantaneous WebSocket updates.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/create-poll">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                Create a Poll
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Community Polls
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Explore active discussions and cast your vote</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => handleFilterChange('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === '' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleFilterChange('closed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === 'closed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Polls Feed */}
      {loading ? (
        <LoadingSpinner message="Fetching community polls..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchPolls(page, statusFilter)} />
      ) : polls.length === 0 ? (
        <EmptyState
          title="No Polls Found"
          description={statusFilter ? `No ${statusFilter} polls found.` : 'Be the first to publish a poll!'}
          actionText="Create First Poll"
          onAction={() => window.location.href = '/create-poll'}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  )
}

export default Dashboard
