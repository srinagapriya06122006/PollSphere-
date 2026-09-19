import React from 'react'
import { Radio, ShieldCheck, BarChart3, Layers } from 'lucide-react'

export const PlatformHighlights = () => {
  const highlights = [
    {
      icon: Radio,
      tag: 'REAL-TIME',
      title: 'Live vote updates',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/70 dark:border-indigo-800/70',
    },
    {
      icon: ShieldCheck,
      tag: 'SECURE',
      title: 'Protected authentication',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/70 dark:border-emerald-800/70',
    },
    {
      icon: BarChart3,
      tag: 'ANALYTICS',
      title: 'Visual insights',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/70 dark:border-purple-800/70',
    },
    {
      icon: Layers,
      tag: 'SCALABLE',
      title: 'Go + Redis + WebSocket',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/70 dark:border-amber-800/70',
    },
  ]

  return (
    <section className="w-full py-6 sm:py-8 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.bg}`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {item.tag}
                  </span>
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PlatformHighlights
