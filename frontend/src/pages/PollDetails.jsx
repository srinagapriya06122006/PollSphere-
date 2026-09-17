import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, User, CheckCircle, ArrowLeft, BarChart2, ShieldAlert } from 'lucide-react'
import pollService from '../services/pollService'
import voteService from '../services/voteService'
import { useAuth } from '../context/AuthContext'
import { usePollWebSocket } from '../hooks/usePollWebSocket'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import OptionVoteButton from '../components/poll/OptionVoteButton'
import LiveStatusBadge from '../components/poll/LiveStatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'

export const PollDetails = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState(null)

  // Fetch initial poll & results via REST
  const fetchPollData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [pollData, resultsData] = await Promise.all([
        pollService.getPollById(id),
        voteService.getResults(id),
      ])
      setPoll(pollData)
      setResults(resultsData)
      if (resultsData?.userVotedOptionId) {
        setHasVoted(true)
        setSelectedOption(resultsData.userVotedOptionId)
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to load poll details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPollData()
  }, [id])

  // WebSocket Live Real-Time Updates Callback
  const handleLiveUpdate = useCallback((liveData) => {
    setResults(liveData)
    if (liveData?.userVotedOptionId) {
      setHasVoted(true)
      setSelectedOption(liveData.userVotedOptionId)
    }
  }, [])

  // Dedicated WebSocket custom hook
  const { status: wsStatus, reconnect: reconnectWs } = usePollWebSocket(id, handleLiveUpdate)

  const handleVote = async () => {
    if (!selectedOption || voting || hasVoted) return
    setVoting(true)
    setError(null)

    try {
      await voteService.castVote(id, selectedOption)
      setHasVoted(true)
      // Refresh results immediately (WebSocket will also broadcast)
      const freshResults = await voteService.getResults(id)
      setResults(freshResults)
    } catch (err) {
      setError(err.customMessage || 'Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  if (loading) return <LoadingSpinner message="Connecting to live poll..." />
  if (error && !poll) return <ErrorState message={error} onRetry={fetchPollData} />
  if (!poll) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <Card className="p-8 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {poll.creator_name || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(poll.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold capitalize">
              {poll.status}
            </span>
            <LiveStatusBadge status={wsStatus} onRetry={reconnectWs} />
          </div>
        </div>

        {/* Question Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-snug tracking-tight">
          {poll.question}
        </h1>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Poll Options List */}
        <div className="space-y-3 pt-2">
          {poll.options.map((option) => {
            const voteResult = results?.results?.find((r) => r.optionId === option.id)
            const isSelected = selectedOption === option.id

            return (
              <OptionVoteButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                hasVoted={hasVoted}
                voteResult={voteResult}
                totalVotes={results?.totalVotes || 0}
                onClick={() => setSelectedOption(option.id)}
              />
            )
          })}
        </div>

        {/* Actions & Live Stats Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>
              Total Votes Cast: <strong className="text-slate-200 font-bold text-sm tabular-nums">{results?.totalVotes || 0}</strong>
            </span>
          </div>

          <div>
            {!isAuthenticated ? (
              <Link to="/login" state={{ from: { pathname: `/polls/${id}` } }}>
                <Button variant="primary" size="md">
                  Sign In to Vote
                </Button>
              </Link>
            ) : !hasVoted ? (
              <Button
                variant="primary"
                size="md"
                disabled={!selectedOption || voting}
                isLoading={voting}
                onClick={handleVote}
              >
                Submit Vote
              </Button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-800/40">
                <CheckCircle className="w-4 h-4" /> You cast your vote
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PollDetails
