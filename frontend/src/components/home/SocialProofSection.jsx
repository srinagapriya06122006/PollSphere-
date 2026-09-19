import React from 'react'
import { Vote, Layers, Users, Zap, Award } from 'lucide-react'

export const SocialProofSection = () => {
  const stats = [
    {
      icon: Vote,
      value: '10,000+',
      label: 'Votes Cast',
      change: '+24% this week',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      icon: Layers,
      value: '500+',
      label: 'Polls Created',
      change: 'Active topics',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-800/60',
    },
    {
      icon: Users,
      value: '1,200+',
      label: 'Community Users',
      change: 'Global contributors',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      icon: Zap,
      value: '99.9%',
      label: 'Real-Time Delivery',
      change: '<50ms WebSocket latency',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/60',
    },
  ]

  return (
    <section className="w-full py-8 sm:py-10 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>Trusted By Communities Worldwide</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Powering live consensus, classroom discussions, and tech meetups across the globe.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {item.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  {item.value}
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{item.change}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SocialProofSection
