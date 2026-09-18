import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusCircle,
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  Compass,
  Radio,
  Server,
  Activity,
  Trophy,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import pollService from '../services/pollService'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'
import PollCard from '../components/poll/PollCard'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [recentPolls, setRecentPolls] = useState([])
  const [loadingPolls, setLoadingPolls] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoadingPolls(true)
        const data = await pollService.getPolls(1, 4)
        setRecentPolls(data?.polls || [])
      } catch (err) {
        console.warn('Failed to load recent polls for dashboard preview', err)
      } finally {
        setLoadingPolls(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Hero Section (High-Contrast in Light and Dark Mode) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-100/80 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl transition-colors duration-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time High-Concurrency Polling Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Instant Audience Feedback, Powered by Go & Redis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              Create live interactive polls, collect sub-second vote updates via WebSockets, and uncover AI-driven insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/explore">
              <Button variant="outline" size="md" className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-500" />
                Explore Polls
              </Button>
            </Link>
            <Link to="/create-poll">
              <Button variant="primary" size="md" className="flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                <PlusCircle className="w-4 h-4" />
                Create Poll
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Telemetry & Cluster Activity Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-sm transition-colors duration-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">WebSocket Live Gateway</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            <span>Redis Pub/Sub Synchronized</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-purple-500" />
            <span>Sub-millisecond Broadcasts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition"
          >
            <Trophy className="w-3.5 h-3.5" /> View Community Leaderboard &rarr;
          </Link>
        </div>
      </div>

      {/* 3. Analytics Dashboard Section */}
      <AnalyticsDashboard />

      {/* 4. Recent Community Polls Preview */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Trending & Recent Polls
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live active polls from the community</p>
          </div>

          <Link
            to="/explore"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition"
          >
            Explore all polls <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingPolls ? (
          <LoadingSpinner message="Fetching recent polls..." />
        ) : recentPolls.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <BarChart3 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">No active polls found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to launch an interactive live poll.
            </p>
            <Link to="/create-poll" className="inline-block mt-2">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Create your first poll
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
