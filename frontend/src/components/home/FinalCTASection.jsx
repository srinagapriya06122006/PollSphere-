import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Compass } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

export const FinalCTASection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#020617] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 text-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 shadow-sm">
          {/* Subtle ambient PollSphere purple/blue glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-indigo-500/10 blur-2xl pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-xl mx-auto space-y-3.5 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to see what your community thinks?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
              Create or explore live polls and discover real-time opinions.
            </p>

            {/* Compact Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? '/create-poll' : '/login?redirect=/create-poll'}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 px-6 py-2.5 sm:py-3 text-sm font-bold transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create a Poll
                </Button>
              </Link>

              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 text-sm font-semibold border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Compass className="w-4 h-4 text-indigo-500" />
                  Explore Polls
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection

