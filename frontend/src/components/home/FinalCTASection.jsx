import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

export const FinalCTASection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative w-full py-14 sm:py-20 overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl shadow-2xl shadow-indigo-950/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Get Started Free
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            Ready to see what people think?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
            Create a poll, share it with your community, and watch responses arrive in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              to={isAuthenticated ? '/create-poll' : '/login?redirect=/create-poll'}
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 px-8 py-3.5 text-sm sm:text-base font-bold transition-all hover:scale-105"
              >
                <span>Create a Poll</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/explore" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Explore Polls</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection
