import React, { useState } from 'react'
import { Flame, CheckCircle2, BarChart2, Sparkles } from 'lucide-react'

export const LivePollPreview = () => {
  const [selectedOption, setSelectedOption] = useState('2') // Default AI/ML selected
  const [hasVoted, setHasVoted] = useState(true)
  const [totalVotes, setTotalVotes] = useState(123)

  const [options, setOptions] = useState([
    { id: '1', text: 'React / Next.js', votes: 42, percentage: 34 },
    { id: '2', text: 'AI & Machine Learning', votes: 52, percentage: 42 },
    { id: '3', text: 'Cloud Computing (AWS/GCP)', votes: 17, percentage: 14 },
    { id: '4', text: 'Cyber Security', votes: 12, percentage: 10 },
  ])

  const handleVote = (id) => {
    if (id === selectedOption) return

    const newOptions = options.map((opt) => {
      let count = opt.votes
      if (opt.id === id) count += 1
      if (opt.id === selectedOption && count > 0) count -= 1
      return { ...opt, votes: count }
    })

    const newTotal = totalVotes + (selectedOption ? 0 : 1)
    const updated = newOptions.map((opt) => ({
      ...opt,
      percentage: Math.round((opt.votes / newTotal) * 100),
    }))

    setSelectedOption(id)
    setHasVoted(true)
    setOptions(updated)
    setTotalVotes(newTotal)
  }

  return (
    <div className="w-full">
      {/* Real Public Trending Poll Card */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xl shadow-indigo-950/5 dark:shadow-black/50 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
        {/* Glow ambient background accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/70 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Trending Poll
            </span>

            {/* Pulsing Green Dot Real-time indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE NOW
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
            {totalVotes} Votes
          </span>
        </div>

        {/* Question */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <span>Engineering & Careers</span>
            <span className="text-slate-400 font-normal">Click to vote</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
            Which technology should students learn in 2027?
          </h3>
        </div>

        {/* Interactive Options & Animated Progress Bars */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleVote(opt.id)}
                className={`w-full text-left relative overflow-hidden rounded-2xl p-3.5 border transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500/70 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Proportional Background Fill Bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-2xl transition-all duration-500 ${
                    isSelected
                      ? 'bg-indigo-500/25 dark:bg-indigo-500/35'
                      : 'bg-slate-200/60 dark:bg-slate-700/30'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />

                {/* Text & Percentage Overlay */}
                <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-400/40'
                          : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                    />
                    <span
                      className={`font-bold truncate ${
                        isSelected
                          ? 'text-indigo-950 dark:text-indigo-200'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                    <span
                      className={`font-mono font-bold text-xs sm:text-sm ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {opt.percentage}%
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
            Instant WebSocket distribution
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Synced
          </span>
        </div>
      </div>
    </div>
  )
}

export default LivePollPreview
