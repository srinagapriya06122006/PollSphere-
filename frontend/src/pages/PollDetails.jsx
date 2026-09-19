import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Clock,
  User,
  CheckCircle,
  ArrowLeft,
  BarChart2,
  Share2,
  Download,
  QrCode,
  Sparkles,
  Hourglass,
  Layers,
  Copy,
  Compass,
  PlusCircle,
  RefreshCw,
  Search,
  Check,
  Flame,
} from 'lucide-react'
import pollService from '../services/pollService'
import voteService from '../services/voteService'
import { useAuth } from '../context/AuthContext'
import { usePollWebSocket } from '../hooks/usePollWebSocket'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import OptionVoteButton from '../components/poll/OptionVoteButton'
import LiveStatusBadge from '../components/poll/LiveStatusBadge'
import QRCodeModal from '../components/poll/QRCodeModal'
import ExportModal from '../components/poll/ExportModal'
import AIInsightsCard from '../components/poll/AIInsightsCard'
import PollComments from '../components/poll/PollComments'
import { getFeaturedPollById, castFeaturedVote } from '../data/featuredPolls'

export const PollDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState(null)
  const [selectedOption, setSelectedOption] = useState(
    location.state?.preselectedOption || null
  )
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [cloning, setCloning] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [error, setError] = useState(null)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Fetch initial poll & results via REST with seamless fallback to featured sample polls
  const fetchPollData = async () => {
    if (!id || id === 'undefined') {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setNotFound(false)

    // Check if it's a known featured sample poll first
    const featuredMatch = getFeaturedPollById(id)
    if (featuredMatch) {
      setPoll(featuredMatch.poll)
      setResults(featuredMatch.results)
      setIsFeatured(true)
      if (featuredMatch.results?.userVotedOptionId) {
        setHasVoted(true)
        setSelectedOption(featuredMatch.results.userVotedOptionId)
      } else if (location.state?.preselectedOption) {
        setSelectedOption(location.state.preselectedOption)
      }
      setLoading(false)
      return
    }

    // Try backend REST API
    try {
      const [pollData, resultsData] = await Promise.all([
        pollService.getPollById(id),
        voteService.getResults(id),
      ])
      setPoll(pollData)
      setResults(resultsData)
      setIsFeatured(false)
      if (resultsData?.userVotedOptionId) {
        setHasVoted(true)
        setSelectedOption(resultsData.userVotedOptionId)
      } else if (location.state?.preselectedOption) {
        setSelectedOption(location.state.preselectedOption)
      }
    } catch (err) {
      // If backend fails or not found, check if a fallback sample matches
      const fallback = getFeaturedPollById(id)
      if (fallback) {
        setPoll(fallback.poll)
        setResults(fallback.results)
        setIsFeatured(true)
        if (fallback.results?.userVotedOptionId) {
          setHasVoted(true)
          setSelectedOption(fallback.results.userVotedOptionId)
        }
      } else {
        setNotFound(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClonePoll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/polls/${id}` } } })
      return
    }

    if (isFeatured) {
      // If cloning a featured poll, create via API
      try {
        setCloning(true)
        const cloned = await pollService.createPoll({
          question: `${poll.question} (Copy)`,
          category: poll.category || 'general',
          options: poll.options.map((o) => o.text),
        })
        if (cloned?.id) {
          navigate(`/polls/${cloned.id}`)
        }
      } catch (e) {
        setError('Failed to duplicate poll')
      } finally {
        setCloning(false)
      }
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

  // WebSocket Live Real-Time Updates Callback (for real polls)
  const handleLiveUpdate = useCallback(
    (liveData) => {
      if (isFeatured) return // Local mock already synced

      if (liveData?.status === 'closed') {
        setPoll((prev) => (prev ? { ...prev, status: 'closed' } : prev))
      }

      if (liveData?.data) {
        setResults(liveData.data)
        if (liveData.data.userVotedOptionId) {
          setHasVoted(true)
          setSelectedOption(liveData.data.userVotedOptionId)
        }
      } else if (liveData) {
        setResults(liveData)
        if (liveData?.userVotedOptionId) {
          setHasVoted(true)
          setSelectedOption(liveData.userVotedOptionId)
        }
      }
    },
    [isFeatured]
  )

  const { status: wsStatus, reconnect: reconnectWs } = usePollWebSocket(
    isFeatured ? null : id,
    handleLiveUpdate
  )

  const handleVote = async () => {
    if (!selectedOption || voting || hasVoted) return
    setVoting(true)
    setError(null)

    // Handle featured sample polls with local persistence
    if (isFeatured) {
      setTimeout(() => {
        const updated = castFeaturedVote(id, selectedOption)
        setPoll(updated.poll)
        setResults(updated.results)
        setHasVoted(true)
        setVoting(false)
        window.dispatchEvent(
          new CustomEvent('live-notification', {
            detail: {
              title: 'Vote Cast Successfully',
              message: `Your vote was recorded on "${poll?.question}"`,
              type: 'success',
            },
          })
        )
      }, 300)
      return
    }

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
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
    const hours = Math.floor(mins / (1000 * 60 * 60))
    if (hours < 24) return `Closes in ${hours}h`
    const days = Math.floor(hours / 24)
    return `Closes in ${days}d`
  }

  const expiryText = getExpiryText()

  // 1. Sleek Skeleton Loading State
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="h-8 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>

          <div className="space-y-3 pt-4">
            <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading poll... Fetching latest results...
        </div>
      </div>
    )
  }

  // 2. Redesigned "Poll Not Available" State
  if (notFound || (!poll && error)) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center shadow-2xl space-y-5">
          {/* Glowing Illustration Icon */}
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Search className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black font-['Outfit',sans-serif] text-slate-900 dark:text-slate-100">
              Poll Not Available
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              This poll may have been removed, expired, or the link is invalid. Please explore other active community polls or create a new one.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full font-bold shadow-lg shadow-indigo-600/20">
                <Compass className="w-4 h-4 mr-2" />
                Explore Active Polls
              </Button>
            </Link>

            <Link to="/create-poll" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full font-bold">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <button
              onClick={fetchPollData}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <span>•</span>
            <Link
              to="/polls/sample-1"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Try Featured Poll
            </Link>
          </div>
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
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore Polls
        </Link>

        <div className="flex items-center gap-2">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Clone / Duplicate Poll Button */}
          <button
            onClick={handleClonePoll}
            disabled={cloning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
            title="Duplicate question & choices into a fresh poll"
          >
            <Copy className="w-3.5 h-3.5 text-amber-500" />
            <span>{cloning ? 'Cloning...' : 'Duplicate'}</span>
          </button>

          {/* QR Share Modal Button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-500" />
            <span>QR Code</span>
          </button>

          {/* Export Results Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export</span>
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
              {poll.creator_name || 'Community Member'}
            </span>

            <span className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {new Date(poll.created_at || Date.now()).toLocaleDateString()}
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
            <LiveStatusBadge
              status={isFeatured ? 'connected' : wsStatus}
              onRetry={reconnectWs}
            />
          </div>
        </div>

        {/* Question Title */}
        <h1 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
          {poll.question}
        </h1>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
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
                onClick={() => {
                  if (!hasVoted && poll.status === 'active') {
                    setSelectedOption(option.id)
                  }
                }}
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
            {!isAuthenticated && !isFeatured ? (
              <Link
                to={`/login?redirect=${encodeURIComponent(`/polls/${id}`)}`}
                state={{ from: { pathname: `/polls/${id}` } }}
              >
                <Button variant="primary" size="md" className="font-bold">
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
                className="font-bold shadow-lg shadow-indigo-600/20"
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
