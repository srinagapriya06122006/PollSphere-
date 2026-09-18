import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Activity, ArrowRight, CheckCircle2, User, Vote, Hourglass } from 'lucide-react'
import Card from '../common/Card'

export const PollCard = ({ poll }) => {
  const isActive = poll.status === 'active'

  const categoryIcons = {
    technology: '💻',
    education: '🎓',
    sports: '⚽',
    entertainment: '🎬',
    general: '🌐',
  }

  // Format expiration countdown if applicable
  const getExpiryText = () => {
    if (!poll.expires_at) return null
    const exp = new Date(poll.expires_at)
    const now = new Date()
    const diff = exp - now

    if (diff <= 0) return 'Expired'
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 60) return `Expires in ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Expires in ${hours}h`
    const days = Math.floor(hours / 24)
    return `Expires in ${days}d`
  }

  const expiryText = getExpiryText()

  return (
    <Link to={`/polls/${poll.id}`} className="block h-full">
      <Card hover className="h-full flex flex-col justify-between group relative overflow-hidden">
        <div className="space-y-4">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold capitalize">
              <span>{categoryIcons[poll.category] || '🌐'}</span>
              <span>{poll.category || 'General'}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {expiryText && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                  <Hourglass className="w-3 h-3" />
                  {expiryText}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border capitalize text-[11px] ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Activity className="w-3 h-3" />
                {poll.status}
              </span>
            </div>
          </div>

          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {poll.question}
          </h3>

          {/* Options Preview */}
          <div className="space-y-1.5">
            {poll.options.slice(0, 3).map((opt) => (
              <div
                key={opt.id}
                className="text-xs font-semibold text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80 truncate flex items-center justify-between group-hover:border-slate-300 dark:group-hover:border-slate-700/80 transition-colors"
              >
                <span className="truncate">{opt.text}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors shrink-0 ml-2" />
              </div>
            ))}
            {poll.options.length > 3 && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold pl-1">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[110px]">
              {poll.creator_name || 'Anonymous'}
            </span>
          </span>

          <div className="flex items-center gap-3">
            {poll.total_votes !== undefined && (
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-black text-[11px]">
                <Vote className="w-3.5 h-3.5 text-indigo-500" />
                {poll.total_votes}
              </span>
            )}
            <span className="text-indigo-600 dark:text-indigo-400 font-black group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Vote <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default PollCard
