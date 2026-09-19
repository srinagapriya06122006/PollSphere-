import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Laptop, GraduationCap, Trophy, Film, Sparkles, Compass } from 'lucide-react'

export const CategoryCardsSection = () => {
  const categories = [
    {
      id: 'technology',
      title: 'Technology',
      tagline: 'AI, Web, Cloud & Systems',
      icon: Laptop,
      count: '180+ Polls',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/50',
      accent: 'from-indigo-600 to-blue-600',
    },
    {
      id: 'education',
      title: 'Education',
      tagline: 'Colleges, Exams & Placements',
      icon: GraduationCap,
      count: '95+ Polls',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50',
      accent: 'from-purple-600 to-pink-600',
    },
    {
      id: 'sports',
      title: 'Sports & Fitness',
      tagline: 'Cricket, Football & Esports',
      icon: Trophy,
      count: '65+ Polls',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/50',
      accent: 'from-amber-500 to-orange-600',
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      tagline: 'Cinema, Gaming & Pop Culture',
      icon: Film,
      count: '110+ Polls',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/50',
      accent: 'from-rose-500 to-red-600',
    },
    {
      id: 'general',
      title: 'General Discussions',
      tagline: 'Open Debates & Opinions',
      icon: Sparkles,
      count: '140+ Polls',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/50',
      accent: 'from-emerald-500 to-teal-600',
    },
  ]

  return (
    <section className="w-full py-12 sm:py-16 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore By Interest</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Browse Poll Categories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Filter public polls instantly by topic and contribute your opinion.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.bg}`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {cat.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span>Browse Category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategoryCardsSection
