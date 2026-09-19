import React from 'react'
import { PlusCircle, Smartphone, BarChart3, Users } from 'lucide-react'
import Card from '../common/Card'

export const WhatYouCanDoSection = () => {
  const cards = [
    {
      icon: PlusCircle,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/60',
      title: 'Create Live Polls',
      description: 'Create questions and answer choices in seconds.',
    },
    {
      icon: Smartphone,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/60',
      title: 'Collect Votes',
      description: 'Let your audience participate from any device.',
    },
    {
      icon: BarChart3,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
      title: 'Real-Time Results',
      description: 'Watch genuine responses update instantly via WebSockets.',
    },
    {
      icon: Users,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
      title: 'Analytics',
      description: 'Explore participation trends and category breakdowns.',
    },
  ]

  return (
    <section id="features" className="w-full py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            What Can You Do With PollSphere?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Everything you need to gather opinions and view results live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, idx) => {
            const Icon = c.icon
            return (
              <Card
                key={idx}
                className="p-6 flex flex-col justify-between h-full space-y-3.5 border-slate-200/80 dark:border-slate-800 text-left transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${c.bgColor}`}
                  >
                    <Icon className={`w-5 h-5 ${c.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {c.description}
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
