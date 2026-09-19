import React from 'react'
import { ArrowRight, ArrowDown, User, Send, Server, Database, Radio, RefreshCw } from 'lucide-react'
import Card from '../common/Card'

export const RealtimeSection = () => {
  const steps = [
    {
      title: 'Voter',
      subtitle: 'Participant action',
      icon: User,
      tech: null,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      title: 'Vote Request',
      subtitle: 'HTTP payload',
      icon: Send,
      tech: null,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
    },
    {
      title: 'Go Backend',
      subtitle: 'Gin Clean API',
      icon: Server,
      tech: 'Go',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      title: 'MongoDB',
      subtitle: 'Persistent storage',
      icon: Database,
      tech: 'MongoDB',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      title: 'Redis Pub/Sub',
      subtitle: 'Event bus',
      icon: Radio,
      tech: 'Redis',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/60',
    },
    {
      title: 'WebSocket',
      subtitle: 'Broadcast channel',
      icon: Radio,
      tech: 'WebSocket',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
    },
    {
      title: 'Updated Results',
      subtitle: 'Synchronized live',
      icon: RefreshCw,
      tech: null,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/60',
    },
  ]

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Built for Real-Time Interaction
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            PollSphere uses real-time communication to synchronize genuine votes and results without requiring users to refresh the page.
          </p>
        </div>

        {/* Static Architecture Visualization Card */}
        <Card className="p-6 sm:p-8 border-indigo-100 dark:border-slate-800 shadow-md shadow-indigo-950/5">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 items-center">
            {steps.map((s, idx) => {
              const Icon = s.icon
              const isLast = idx === steps.length - 1

              return (
                <div key={idx} className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 h-full justify-between">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm mb-2 ${s.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {s.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {s.subtitle}
                    </p>
                  </div>

                  {s.tech ? (
                    <span className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
                      {s.tech}
                    </span>
                  ) : (
                    <span className="mt-2 text-[10px] text-transparent select-none">-</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Simple technology labels row */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Go
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              MongoDB
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Redis
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              WebSocket
            </span>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default RealtimeSection
