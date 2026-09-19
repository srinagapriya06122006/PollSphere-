import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Medal,
  Award,
  Vote,
  BarChart3,
  TrendingUp,
  Flame,
  ArrowRight,
  ExternalLink,
  Crown,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import apiClient from '../api/client'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export const Leaderboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeaderboards = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/analytics/overview').catch(() => apiClient.get('/analytics/dashboard'))
      setStats(res.data)
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch leaderboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboards()

    const handleAuthChange = () => {
      fetchLeaderboards()
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => window.removeEventListener('auth-change', handleAuthChange)
  }, [])

  const topCreators = stats?.topCreators || []
  const topVoters = stats?.topVoters || []
  const topPolls = stats?.popularPolls || stats?.topPolls || []

  const getRankBadge = (rank) => {
    if (rank === 0)
      return (
        <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shadow-sm">
          <Crown className="w-4 h-4" />
        </div>
      )
    if (rank === 1)
      return (
        <div className="w-7 h-7 rounded-xl bg-slate-300 dark:bg-slate-400/20 text-slate-800 dark:text-slate-200 border border-slate-400/30 flex items-center justify-center font-black text-xs">
          2
        </div>
      )
    if (rank === 2)
      return (
        <div className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-700 dark:text-amber-500 border border-amber-700/30 flex items-center justify-center font-black text-xs">
          3
        </div>
      )
    return (
      <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-xs">
        {rank + 1}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" /> Platform Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
            Celebrating our top community poll creators, most active voters, and trending questions.
          </p>
        </div>

        <button
          onClick={fetchLeaderboards}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2 text-xs font-bold shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Rankings</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating leaderboard rankings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeaderboards} />
      ) : (
        <div className="space-y-8">
          {/* Top 3 Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Creators Leaderboard */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Top Poll Creators
                  </h3>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">By Published Polls</span>
              </div>

              {topCreators.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No poll creators registered yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topCreators.map((creator, idx) => (
                    <div
                      key={creator.userId || idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-slate-700 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getRankBadge(idx)}
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {getInitials(creator.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{creator.name}</p>
                          <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate">{creator.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {creator.count}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">polls</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Most Active Voters Leaderboard */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Most Active Voters
                  </h3>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">By Votes Cast</span>
              </div>

              {topVoters.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No votes recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topVoters.map((voter, idx) => (
                    <div
                      key={voter.userId || idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-400 dark:hover:border-slate-700 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getRankBadge(idx)}
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {getInitials(voter.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{voter.name}</p>
                          <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate">{voter.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {voter.count}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Top Engaged Polls Ranking */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Highest Engagement Questions
                </h3>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">Top 5 Community Polls</span>
            </div>

            {topPolls.length === 0 ? (
              <div className="py-8 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                No poll engagement data recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {topPolls.map((poll, idx) => {
                  const pollId = poll.id || poll._id || poll.pollId
                  const voteCount = poll.totalVotes ?? poll.votes ?? poll.voteCount ?? 0
                  return (
                    <Link
                      key={pollId || idx}
                      to={pollId ? `/polls/${pollId}` : '/explore'}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-slate-700 flex items-center justify-between gap-4 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-black text-slate-600 dark:text-slate-400 font-mono w-6 text-center">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition truncate">
                            {poll.question}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">
                            {poll.category || 'General'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                            {voteCount}
                          </span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">votes</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
