import React, { useState } from 'react'
import { CheckCircle2, BarChart2, Radio, Zap, Sparkles, Activity } from 'lucide-react'

export const LivePollPreview = () => {
  const [selectedOption, setSelectedOption] = useState('2') // Default AI & Cloud
  const [isVoting, setIsVoting] = useState(false)
  const [totalVotes, setTotalVotes] = useState(148)

  const [options, setOptions] = useState([
    { id: '1', text: 'Distributed Systems & Go', votes: 46, percentage: 31 },
    { id: '2', text: 'AI & Cloud Infrastructure', votes: 68, percentage: 46 },
    { id: '3', text: 'Full-Stack React & WebSockets', votes: 24, percentage: 16 },
    { id: '4', text: 'Cybersecurity & Zero-Trust', votes: 10, percentage: 7 },
  ])

  const handleVote = (id) => {
    if (id === selectedOption) return

    setIsVoting(true)
    setTimeout(() => setIsVoting(false), 300)

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
    setOptions(updated)
    setTotalVotes(newTotal)
  }

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Ambient background glow and grid */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/15 dark:bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Card Top-Right: "Live Results" */}
      <div className="hidden sm:flex absolute -top-4 -right-2 z-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-950/10 dark:shadow-black/40 animate-bounce-subtle">
        <div className="w-7 h-7 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 fill-current" />
        </div>
        <div>
          <div className="text-[11px] font-black text-slate-900 dark:text-slate-100 leading-tight">
            Live Results
          </div>
          <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
            Results update instantly
          </div>
        </div>
      </div>

      {/* Floating Card Bottom-Left: "Real-Time Sync" */}
      <div className="hidden sm:flex absolute -bottom-4 -left-2 z-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-950/10 dark:shadow-black/40">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <div>
          <div className="text-[11px] font-black text-slate-900 dark:text-slate-100 leading-tight">
            Real-Time Sync
          </div>
          <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
            WebSocket Connected
          </div>
        </div>
      </div>

      {/* Main Interactive Product Card */}
      <div className="relative z-10 rounded-3xl bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-7 shadow-2xl shadow-indigo-950/10 dark:shadow-black/60 transition-all duration-300">
        {/* Card Header: Category, Status & Live indicator */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Technology
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Active
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>{totalVotes} votes</span>
          </div>
        </div>

        {/* Poll Question */}
        <div className="mb-5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
            Which software architecture should engineering teams adopt in 2027?
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Tap an option below to test live vote distribution.
          </p>
        </div>

        {/* Interactive Options List with Dynamic Bars */}
        <div className="space-y-2.5">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleVote(opt.id)}
                className={`w-full text-left relative overflow-hidden rounded-2xl p-3 sm:p-3.5 border transition-all duration-200 group ${
                  isSelected
                    ? 'border-indigo-500/80 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Proportional Progress Bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-2xl transition-all duration-500 ${
                    isSelected
                      ? 'bg-indigo-500/25 dark:bg-indigo-500/35'
                      : 'bg-slate-200/50 dark:bg-slate-700/30'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />

                {/* Option Text & Percentage */}
                <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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

        {/* Card Footer: Real-time status */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            Gorilla WebSocket Engine
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Synchronized live
          </span>
        </div>
      </div>
    </div>
  )
}

export default LivePollPreview
