import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  User,
  CheckCircle,
  ArrowLeft,
  BarChart2,
  ShieldAlert,
  Share2,
  Download,
  QrCode,
  Sparkles,
  Hourglass,
  Layers,
  Copy,
} from 'lucide-react'
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
import QRCodeModal from '../components/poll/QRCodeModal'
import ExportModal from '../components/poll/ExportModal'
import AIInsightsCard from '../components/poll/AIInsightsCard'
import PollComments from '../components/poll/PollComments'

export const PollDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [cloning, setCloning] = useState(false)
  const [error, setError] = useState(null)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Fetch initial poll & results via REST
  const fetchPollData = async () => {
    if (!id || id === 'undefined') {
      setError("We couldn't load this poll. The poll link is invalid or missing.")
      setLoading(false)
      return
    }

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
      setError("We couldn't load this poll. It may have been removed or expired.")
    } finally {
      setLoading(false)
    }
  }

  const handleClonePoll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/polls/${id}` } } })
      return
    }
    try {
      setCloning(true)
      const cloned = await pollService.clonePoll(id)
      if (cloned?.id) {
        window.dispatchEvent(
          new CustomEvent('live-notification', {
            detail: {
              title: 'Poll Cloned',
              message: `Duplicated "${poll?.question}" successfully.`,
              type: 'success',
            },
          })
        )
        navigate(`/polls/${cloned.id}`)
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to clone poll')
    } finally {
      setCloning(false)
    }
  }

  useEffect(() => {
    fetchPollData()
  }, [id])

  // WebSocket Live Real-Time Updates Callback
  const handleLiveUpdate = useCallback((liveData) => {
    if (liveData?.status === 'closed') {
      setPoll((prev) => (prev ? { ...prev, status: 'closed' } : prev))
      window.dispatchEvent(
        new CustomEvent('live-notification', {
          detail: {
            title: 'Poll Closed',
            message: 'This poll has reached its expiration time.',
            type: 'warning',
          },
        })
      )
    }

    if (liveData?.data) {
      setResults(liveData.data)
      if (liveData.data.userVotedOptionId) {
        setHasVoted(true)
        setSelectedOption(liveData.data.userVotedOptionId)
      }
    } else {
      setResults(liveData)
      if (liveData?.userVotedOptionId) {
        setHasVoted(true)
        setSelectedOption(liveData.userVotedOptionId)
      }
    }
  }, [])

  const { status: wsStatus, reconnect: reconnectWs } = usePollWebSocket(id, handleLiveUpdate)

  const handleVote = async () => {
    if (!selectedOption || voting || hasVoted) return
    setVoting(true)
    setError(null)

    try {
      await voteService.castVote(id, selectedOption)
      setHasVoted(true)
      const freshResults = await voteService.getResults(id)
      setResults(freshResults)
      window.dispatchEvent(
        new CustomEvent('live-notification', {
          detail: {
            title: 'Vote Cast Successfully',
            message: `Your vote was recorded on "${poll?.question}"`,
            type: 'success',
          },
        })
      )
    } catch (err) {
      setError(err.customMessage || 'Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  const categoryIcons = {
    technology: '💻',
    education: '🎓',
    sports: '⚽',
    entertainment: '🎬',
    general: '🌐',
  }

  const getExpiryText = () => {
    if (!poll?.expires_at) return null
    const exp = new Date(poll.expires_at)
    const now = new Date()
    const diff = exp - now

    if (diff <= 0) return 'Expired'
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 60) return `Closes in ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Closes in ${hours}h`
    const days = Math.floor(hours / 24)
    return `Closes in ${days}d`
  }

  const expiryText = getExpiryText()

  if (loading) return <LoadingSpinner message="Connecting to live poll..." />
  if (error && !poll) {
    return (
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center max-w-md mx-auto my-12 shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
          We couldn't load this poll
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {error}
        </p>
        <div className="flex items-center justify-center gap-3 pt-3">
          {id && id !== 'undefined' && (
            <Button variant="secondary" size="sm" onClick={fetchPollData}>
              Try Again
            </Button>
          )}
          <Link to="/explore">
            <Button variant="primary" size="sm">
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  if (!poll) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          {/* Clone / Duplicate Poll Button */}
          <button
            onClick={handleClonePoll}
            disabled={cloning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
            title="Duplicate question & choices into a fresh poll"
          >
            <Copy className="w-3.5 h-3.5 text-amber-500" />
            <span>{cloning ? 'Cloning...' : 'Duplicate Poll'}</span>
          </button>

          {/* QR Share Modal Button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-500" />
            <span>QR & Share</span>
          </button>

          {/* Export Results Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <Card className="p-8 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-semibold">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold capitalize">
              <span>{categoryIcons[poll.category] || '🌐'}</span>
              <span>{poll.category || 'General'}</span>
            </span>

            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {poll.creator_name || 'Anonymous'}
            </span>

            <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(poll.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {expiryText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                <Hourglass className="w-3.5 h-3.5" />
                {expiryText}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border capitalize ${
                poll.status === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              {poll.status}
            </span>
            <LiveStatusBadge status={wsStatus} onRetry={reconnectWs} />
          </div>
        </div>

        {/* Question Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
          {poll.question}
        </h1>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
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
                hasVoted={hasVoted || poll.status === 'closed'}
                voteResult={voteResult}
                totalVotes={results?.totalVotes || 0}
                onClick={() => setSelectedOption(option.id)}
              />
            )
          })}
        </div>

        {/* Actions & Live Stats Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-400">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span>
              Total Votes Cast:{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-black text-sm tabular-nums">
                {results?.totalVotes || 0}
              </strong>
            </span>
          </div>

          <div>
            {!isAuthenticated ? (
              <Link to={`/login?redirect=${encodeURIComponent(`/polls/${id}`)}`} state={{ from: { pathname: `/polls/${id}` } }}>
                <Button variant="primary" size="md">
                  Sign In to Vote
                </Button>
              </Link>
            ) : poll.status === 'closed' ? (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                This poll is closed
              </span>
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
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle className="w-4 h-4" /> You cast your vote
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* AI Insights Section */}
      <AIInsightsCard pollId={id} totalVotes={results?.totalVotes || 0} />

      {/* Community Discussion Section */}
      <PollComments pollId={id} />

      {/* Modals */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        pollId={id}
        question={poll.question}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        poll={poll}
        results={results}
      />
    </div>
  )
}

export default PollDetails
