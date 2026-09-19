import React from 'react'
import { User, Send, Server, Database, Radio, RefreshCw, ArrowRight, ArrowDown } from 'lucide-react'
import Card from '../common/Card'

export const RealtimeSection = () => {
  const flowNodes = [
    {
      title: 'Voter',
      subtitle: 'React 18 Client',
      icon: User,
      tech: 'React',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      title: 'Vote Request',
      subtitle: 'POST /api/polls/:id/vote',
      icon: Send,
      tech: 'HTTP / JSON',
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
    },
    {
      title: 'Go Backend',
      subtitle: 'Gin Clean API Engine',
      icon: Server,
      tech: 'Go / Gin',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      title: 'MongoDB',
      subtitle: 'Compound Unique Index',
      icon: Database,
      tech: 'MongoDB',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/60 border-green-200/60 dark:border-green-800/60',
    },
    {
      title: 'Redis Pub/Sub',
      subtitle: 'Horizontal Sync Channel',
      icon: Radio,
      tech: 'Redis',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/60',
    },
    {
      title: 'WebSocket',
      subtitle: 'Gorilla Stream Hub',
      icon: Radio,
      tech: 'WebSocket',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
    },
    {
      title: 'Live Results',
      subtitle: 'Synchronized State',
      icon: RefreshCw,
      tech: 'Sub-ms Sync',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/60',
    },
  ]

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Real-Time Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Built for Real-Time Interaction
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            PollSphere synchronizes votes and results across connected clients without requiring page refreshes.
          </p>
        </div>

        {/* Visual Architecture Flow Card */}
        <Card className="p-6 sm:p-8 border-indigo-100 dark:border-slate-800/80 shadow-xl shadow-indigo-950/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-stretch relative">
            {flowNodes.map((node, idx) => {
              const Icon = node.icon
              const isLast = idx === flowNodes.length - 1

              return (
                <div key={idx} className="relative flex flex-col justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 text-center hover:border-indigo-400/50 transition-colors">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm mb-3 ${node.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${node.color}`} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                      {node.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">
                      {node.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="inline-block text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
                      {node.tech}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Technology Badges Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Core Technical Stack
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                React 18
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                Go 1.24 / Gin
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                MongoDB 8.0
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                Redis 7.0 Pub/Sub
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                Gorilla WebSocket
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default RealtimeSection
