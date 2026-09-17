import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Trash2, Clock, ArrowRight, BarChart3 } from 'lucide-react'
import pollService from '../services/pollService'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

export const MyPolls = () => {
  const { user } = useAuth()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMyPolls = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await pollService.getPolls(1, 50)
      const allPolls = data?.polls || []
      const userPolls = allPolls.filter((p) => p.creator_id === user?.id)
      setPolls(userPolls)
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch your polls')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyPolls()
    }
  }, [user])

  const handleDelete = async (e, pollId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return

    try {
      await pollService.deletePoll(pollId)
      setPolls(polls.filter((p) => p.id !== pollId))
    } catch (err) {
      alert(err.customMessage || 'Failed to delete poll')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> My Published Polls
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage, inspect, and track voting performance</p>
        </div>
        <Link to="/create-poll">
          <Button variant="primary" size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Poll
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your polls..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMyPolls} />
      ) : polls.length === 0 ? (
        <EmptyState
          title="You haven't created any polls yet"
          description="Ask a question to start gathering votes and live data."
          actionText="Create First Poll"
          onAction={() => window.location.href = '/create-poll'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <Link key={poll.id} to={`/polls/${poll.id}`}>
              <Card hover className="h-full flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {poll.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {poll.question}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {poll.options.length} options defined
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => handleDelete(e, poll.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Poll
                  </button>

                  <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View Live <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPolls
