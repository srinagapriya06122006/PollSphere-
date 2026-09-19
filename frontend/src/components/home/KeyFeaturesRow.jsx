import React from 'react'
import { Zap, ShieldCheck, BarChart3, Globe, Smartphone } from 'lucide-react'

export const KeyFeaturesRow = () => {
  const features = [
    {
      icon: Zap,
      label: 'Real-Time Updates',
      desc: 'Sub-second sync via WebSockets',
      iconColor: 'text-amber-500',
      badgeBg: 'group-hover:border-amber-500/40 group-hover:bg-amber-500/10',
    },
    {
      icon: ShieldCheck,
      label: 'Secure Voting',
      desc: 'Fingerprint & IP deduplication',
      iconColor: 'text-emerald-500',
      badgeBg: 'group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10',
    },
    {
      icon: BarChart3,
      label: 'Analytics Dashboard',
      desc: 'Rich breakdown & demographics',
      iconColor: 'text-indigo-500',
      badgeBg: 'group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10',
    },
    {
      icon: Globe,
      label: 'Community Polls',
      desc: 'Public discussions & discovery',
      iconColor: 'text-blue-500',
      badgeBg: 'group-hover:border-blue-500/40 group-hover:bg-blue-500/10',
    },
    {
      icon: Smartphone,
      label: 'Mobile Friendly',
      desc: '100% responsive on any device',
      iconColor: 'text-purple-500',
      badgeBg: 'group-hover:border-purple-500/40 group-hover:bg-purple-500/10',
    },
  ]

  return (
    <section className="w-full py-4 sm:py-6 bg-white dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <div
                key={idx}
                className={`group p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] hover:bg-white dark:hover:bg-slate-900 shadow-sm ${f.badgeBg}`}
              >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className={`w-4 h-4 ${f.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {f.label}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {f.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default KeyFeaturesRow
