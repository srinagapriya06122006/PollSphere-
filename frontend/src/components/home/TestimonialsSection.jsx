import React from 'react'
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react'

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: 'Simple and fast polling platform. The UI is sleek and voting feels instantaneous without any reload lag.',
      author: 'Aravind S.',
      role: 'Student Tech Lead & Developer',
      organization: 'SRM Institute of Tech',
      rating: 5,
      avatarBg: 'from-indigo-600 to-purple-600',
      initials: 'AS',
    },
    {
      quote: 'Real-time updates are amazing. We used PollSphere for our live campus hackathon voting and 400+ attendees voted synchronously without a glitch.',
      author: 'Priya Raman',
      role: 'Community Organizer',
      organization: 'DevCon Summit',
      rating: 5,
      avatarBg: 'from-purple-600 to-pink-600',
      initials: 'PR',
    },
    {
      quote: 'Perfect for communities and events. The analytics breakdown and clean dark theme make it look like a Tier-1 enterprise product.',
      author: 'David Chen',
      role: 'Senior Frontend Engineer',
      organization: 'OpenSource Contributor',
      rating: 5,
      avatarBg: 'from-emerald-600 to-teal-600',
      initials: 'DC',
    },
  ]

  return (
    <section className="w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            What Users Say
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Hear from students, event organizers, and engineering teams using PollSphere daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* 5-star rating */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Details */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                    <span>{t.author}</span>
                    <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" title="Verified User" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {t.role} • <span className="font-semibold">{t.organization}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
