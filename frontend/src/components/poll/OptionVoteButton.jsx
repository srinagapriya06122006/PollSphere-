import React from 'react'
import { CheckCircle } from 'lucide-react'

export const OptionVoteButton = ({
  option,
  isSelected,
  hasVoted,
  voteResult,
  totalVotes,
  onClick,
}) => {
  const percentage = voteResult?.percentage || 0
  const voteCount = voteResult?.voteCount || 0

  return (
    <div
      onClick={!hasVoted ? onClick : undefined}
      className={`relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 ${
        hasVoted
          ? isSelected
            ? 'border-emerald-500/70 bg-emerald-950/20'
            : 'border-slate-800/90 bg-slate-900/40'
          : isSelected
          ? 'border-emerald-500 bg-slate-900 ring-2 ring-emerald-500/20 cursor-pointer'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 cursor-pointer active:scale-[0.99]'
      }`}
    >
      {/* Animated visual progress background when voted */}
      {hasVoted && (
        <div
          className={`absolute inset-0 transition-all duration-700 ease-out pointer-events-none ${
            isSelected ? 'bg-emerald-500/20' : 'bg-slate-800/40'
          }`}
          style={{ width: `${percentage}%` }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
              isSelected
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-950'
                : 'border-slate-600 bg-slate-800 text-transparent'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
            {option.text}
          </span>
        </div>

        {hasVoted && (
          <div className="flex items-center gap-3 text-right shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
            </span>
            <span className="text-sm font-bold text-emerald-400 min-w-[48px] tabular-nums">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OptionVoteButton
