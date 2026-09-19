import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, ArrowRight, Compass, Vote, Clock, Activity, CheckCircle2, User } from 'lucide-react'
import pollService from '../../services/pollService'
import PollCard from '../poll/PollCard'
import Button from '../common/Button'
import { FEATURED_POLLS } from '../../data/featuredPolls'

export const TrendingPollsSection = () => {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrendingPolls = async () => {
      try {
        const data = await pollService.getPolls(1, 6, { status: 'active' })
        if (data?.polls && data.polls.length > 0) {
          setPolls(data.polls)
        } else {
          setPolls(FEATURED_POLLS)
        }
      } catch (err) {
        // Graceful fallback to rich sample community polls so recruiters never see an empty box
        setPolls(FEATURED_POLLS)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingPolls()
  }, [])

  return (
    <section className="w-full py-12 sm:py-16 bg-white dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/60 text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Live Community Discussions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Trending Community Polls
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
              Explore active questions, cast your vote without delay, and see instant consensus shift in real time.
            </p>
          </div>

          <Link to="/explore" className="shrink-0">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 font-bold">
              <span>Browse All Polls</span>
              <ArrowRight className="w-4 h-4 text-indigo-500" />
            </Button>
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="h-6 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="space-y-2 pt-2">
                  <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.slice(0, 6).map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}

        {/* Bottom Bar CTA */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Have a question of your own?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Create a poll in under 30 seconds and share the live link with your group.
              </p>
            </div>
          </div>

          <Link to="/create-poll">
            <Button variant="primary" size="sm" className="font-bold shrink-0">
              Create a Poll Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TrendingPollsSection
