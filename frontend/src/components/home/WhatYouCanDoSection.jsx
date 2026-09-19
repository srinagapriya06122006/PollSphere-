import React from 'react'
import {
  PlusCircle,
  Vote,
  Radio,
  BarChart3,
  ShieldCheck,
  Layers,
} from 'lucide-react'
import Card from '../common/Card'

export const WhatYouCanDoSection = () => {
  const capabilities = [
    {
      icon: PlusCircle,
      title: 'Create Live Polls',
      description: 'Configure multiple questions, custom choices, expiration timers, and category tags in seconds.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      icon: Vote,
      title: 'Real-Time Voting',
      description: 'Cast votes instantly from any mobile or desktop device with instant visual tally updates.',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/60',
    },
    {
      icon: Radio,
      title: 'WebSocket Synchronization',
      description: 'Live multi-client broadcasting powered by Gorilla WebSockets and horizontal Redis Pub/Sub channels.',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/60',
    },
    {
      icon: BarChart3,
      title: 'Interactive Analytics',
      description: 'Visualize voting trends, category distributions, and community participation through interactive charts.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Authentication',
      description: 'Dual sign-in with Google OAuth 2.0 and strict Gmail validation protected by bcrypt and JWT.',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/60 dark:border-cyan-800/60',
    },
    {
      icon: Layers,
      title: 'Poll Management',
      description: 'Clone existing surveys, export CSV/JSON results, generate QR share codes, and monitor active polls.',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
    },
  ]

  return (
    <section id="features" className="w-full py-12 sm:py-16">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Engineered for Modern Polling
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Everything you need to gather opinions, prevent fraud, and view synchronized results live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon
            return (
              <Card
                key={idx}
                className="p-6 flex flex-col justify-between h-full space-y-4 border-slate-200/80 dark:border-slate-800 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${cap.bg}`}
                  >
                    <Icon className={`w-6 h-6 ${cap.color}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhatYouCanDoSection
