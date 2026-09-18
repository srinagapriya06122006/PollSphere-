import React from 'react'
import { Sparkles, BarChart2 } from 'lucide-react'

export const LivePollPreview = () => {
  const options = [
    { id: '1', text: 'AI Assistant', percentage: 48 },
    { id: '2', text: 'Mobile App', percentage: 27 },
    { id: '3', text: 'Analytics Dashboard', percentage: 16 },
    { id: '4', text: 'Community Features', percentage: 9 },
  ]

  return (
    <div className="w-full">
      {/* Static Visual Preview Card — Completely inert, non-clickable */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-lg shadow-indigo-950/5 dark:shadow-black/40 select-none cursor-default pointer-events-none">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Sample Poll
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              Sample Results
            </span>
          </div>

          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
            PRODUCT PREVIEW
          </span>
        </div>

        {/* Question */}
        <div className="mb-5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Question
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
            What should we build next?
          </h3>
        </div>

        {/* Static Visual Options & Proportional Progress Bars */}
        <div className="space-y-3">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="relative overflow-hidden rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 select-none"
            >
              {/* Proportional Background Fill Bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-2xl bg-indigo-500/15 dark:bg-indigo-600/25"
                style={{ width: `${opt.percentage}%` }}
              />

              {/* Text & Percentage Overlay */}
              <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {opt.text}
                  </span>
                </div>

                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {opt.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
            Sample response distribution
          </span>
          <span className="font-semibold text-slate-400 dark:text-slate-500">
            Real voting occurs on live poll pages
          </span>
        </div>
      </div>
    </div>
  )
}

export default LivePollPreview
