import React from 'react'
import { FileEdit, Share2, BarChart2 } from 'lucide-react'

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Create',
      description: 'Create your question and add answer choices.',
      icon: FileEdit,
      accent: 'from-indigo-600 to-indigo-500',
    },
    {
      number: '02',
      title: 'Share',
      description: 'Share your poll with your audience or community.',
      icon: Share2,
      accent: 'from-purple-600 to-purple-500',
    },
    {
      number: '03',
      title: 'Discover',
      description: 'Watch real responses arrive and understand the results.',
      icon: BarChart2,
      accent: 'from-pink-600 to-rose-500',
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Process
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            How PulsePoll Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Get started in seconds without complex setup.
          </p>
        </div>

        {/* Steps Grid with Desktop Connector */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-25 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-black/20"
                >
                  {/* Step Number & Icon Circle */}
                  <div className="relative mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.accent} flex items-center justify-center text-white shadow-md shadow-indigo-950/20`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black flex items-center justify-center shadow-sm">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
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
