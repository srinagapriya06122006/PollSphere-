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
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
        hasVoted
          ? isSelected
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
            : 'border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-900/40'
          : isSelected
          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 cursor-pointer shadow-sm'
          : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/90 cursor-pointer active:scale-[0.99] shadow-sm'
      }`}
    >
      {/* Animated visual progress background when voted */}
      {hasVoted && (
        <div
          className={`absolute inset-0 transition-all duration-700 ease-out pointer-events-none ${
            isSelected ? 'bg-indigo-500/15 dark:bg-indigo-500/25' : 'bg-slate-200/50 dark:bg-slate-800/40'
          }`}
          style={{ width: `${percentage}%` }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
              isSelected
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className={`text-sm font-black tracking-wide ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>
            {option.text}
          </span>
        </div>

        {hasVoted && (
          <div className="flex items-center gap-3 text-right shrink-0">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
              {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
            </span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 min-w-[48px] tabular-nums">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OptionVoteButton
