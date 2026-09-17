import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Activity, ArrowRight, CheckCircle2, User } from 'lucide-react'
import Card from '../common/Card'

export const PollCard = ({ poll }) => {
  const isActive = poll.status === 'active'

  return (
    <Link to={`/polls/${poll.id}`} className="block h-full">
      <Card hover className="h-full flex flex-col justify-between group">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(poll.created_at).toLocaleDateString()}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border capitalize ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Activity className="w-3 h-3" />
              {poll.status}
            </span>
          </div>

          <h3 className="text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
            {poll.question}
          </h3>

          <div className="space-y-1.5">
            {poll.options.slice(0, 3).map((opt) => (
              <div
                key={opt.id}
                className="text-xs text-slate-400 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/80 truncate flex items-center justify-between"
              >
                <span className="truncate">{opt.text}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0 ml-2" />
              </div>
            ))}
            {poll.options.length > 3 && (
              <p className="text-[11px] text-slate-500 font-medium pl-1">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <strong className="text-slate-300 font-medium">{poll.creator_name || 'Anonymous'}</strong>
          </span>
          <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Vote & View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  )
}

export default PollCard
