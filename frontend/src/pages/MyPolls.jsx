import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  Trash2,
  Clock,
  ArrowRight,
  BarChart3,
  Copy,
  Download,
  QrCode,
  ExternalLink,
  Vote,
  Sparkles,
  Inbox,
} from 'lucide-react'
import pollService from '../services/pollService'
import voteService from '../services/voteService'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import QRCodeModal from '../components/poll/QRCodeModal'
import ExportModal from '../components/poll/ExportModal'

export const MyPolls = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cloningId, setCloningId] = useState(null)

  // Modals state
  const [selectedQR, setSelectedQR] = useState(null)
  const [selectedExport, setSelectedExport] = useState(null)

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

    const handleAuthChange = () => {
      if (localStorage.getItem('user')) {
        fetchMyPolls()
      }
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => window.removeEventListener('auth-change', handleAuthChange)
  }, [user])

  const handleDelete = async (e, pollId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return

    try {
      await pollService.deletePoll(pollId)
      setPolls((prev) => prev.filter((p) => p.id !== pollId))
      window.dispatchEvent(
        new CustomEvent('live-notification', {
          detail: {
            title: 'Poll Deleted',
            message: 'Your poll has been removed permanently.',
            type: 'info',
          },
        })
      )
    } catch (err) {
      alert(err.customMessage || 'Failed to delete poll')
    }
  }

  const handleClone = async (e, pollId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setCloningId(pollId)
      const cloned = await pollService.clonePoll(pollId)
      if (cloned?.id) {
        window.dispatchEvent(
          new CustomEvent('live-notification', {
            detail: {
              title: 'Poll Cloned',
              message: 'Duplicated your poll successfully.',
              type: 'success',
            },
          })
        )
        navigate(`/polls/${cloned.id}`)
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to clone poll')
    } finally {
      setCloningId(null)
    }
  }

  const handleOpenQR = (e, poll) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedQR(poll)
  }

  const handleOpenExport = async (e, poll) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const results = await voteService.getResults(poll.id)
      setSelectedExport({ poll, results })
    } catch (err) {
      setSelectedExport({ poll, results: { totalVotes: poll.total_votes || 0, results: [] } })
    }
  }

  const categoryIcons = {
    technology: '💻',
    education: '🎓',
    sports: '⚽',
    entertainment: '🎬',
    general: '🌐',
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> My Published Polls
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
            Manage, clone, export reports, and analyze live audience participation
          </p>
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
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/20">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-200">You haven't created any polls yet</h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Launch your first live poll with custom choices, templates, and expiration scheduler.
            </p>
          </div>
          <Link to="/create-poll" className="inline-block pt-2">
            <Button variant="primary" size="md">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create your first poll
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <Card key={poll.id} hover className="h-full flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] capitalize border border-slate-200 dark:border-slate-700">
                      <span>{categoryIcons[poll.category] || '🌐'}</span>
                      <span>{poll.category || 'General'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`capitalize px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                      poll.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {poll.status}
                  </span>
                </div>

                <Link to={`/polls/${poll.id}`}>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {poll.question}
                  </h3>
                </Link>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{poll.options?.length || 0} options</span>
                  {poll.total_votes !== undefined && (
                    <span className="flex items-center gap-1 text-slate-900 dark:text-slate-200 font-black">
                      <Vote className="w-3.5 h-3.5 text-indigo-500" />
                      {poll.total_votes} votes
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions Toolbar */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1">
                  {/* View */}
                  <Link
                    to={`/polls/${poll.id}`}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="View Poll"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {/* Clone */}
                  <button
                    onClick={(e) => handleClone(e, poll.id)}
                    disabled={cloningId === poll.id}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                    title="Clone / Duplicate Poll"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* QR Share */}
                  <button
                    onClick={(e) => handleOpenQR(e, poll)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="QR Code & Share"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  {/* Export */}
                  <button
                    onClick={(e) => handleOpenExport(e, poll)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Export Results (CSV/JSON)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(e, poll.id)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Delete Poll"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  to={`/polls/${poll.id}`}
                  className="text-indigo-600 dark:text-indigo-400 font-black group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                >
                  Live View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQR && (
        <QRCodeModal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          pollId={selectedQR.id}
          question={selectedQR.question}
        />
      )}

      {/* Export Modal */}
      {selectedExport && (
        <ExportModal
          isOpen={!!selectedExport}
          onClose={() => setSelectedExport(null)}
          poll={selectedExport.poll}
          results={selectedExport.results}
        />
      )}
    </div>
  )
}

export default MyPolls
