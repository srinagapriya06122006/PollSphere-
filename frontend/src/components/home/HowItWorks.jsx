import React from 'react'
import { FileEdit, Share2, BarChart2 } from 'lucide-react'

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      action: 'CREATE',
      title: 'Create a Question',
      description: 'Create a question and add answer choices.',
      icon: FileEdit,
      accent: 'from-indigo-600 to-indigo-500',
    },
    {
      number: '02',
      action: 'SHARE',
      title: 'Share With Community',
      description: 'Share your poll with your audience or community.',
      icon: Share2,
      accent: 'from-purple-600 to-purple-500',
    },
    {
      number: '03',
      action: 'DISCOVER',
      title: 'Discover Insights',
      description: 'Watch responses arrive and understand the results.',
      icon: BarChart2,
      accent: 'from-pink-600 to-rose-500',
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            How PollSphere Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Launch interactive polls and collect live community feedback in three simple steps.
          </p>
        </div>

        {/* 3-Step Cards with Desktop Connector */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-25 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-black/20 hover:-translate-y-1 transition-transform duration-200"
                >
                  {/* Step Number & Icon */}
                  <div className="relative mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.accent} flex items-center justify-center text-white shadow-md shadow-indigo-950/20`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shadow-sm">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Action Tag */}
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
                    {step.number} — {step.action}
                  </span>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xs mt-1">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
