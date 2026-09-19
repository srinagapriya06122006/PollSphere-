import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Compass } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

export const FinalCTASection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="w-full py-16 sm:py-20 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Ready to see what your community thinks?
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
          Create a poll and start collecting responses in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            to={isAuthenticated ? '/create-poll' : '/login?redirect=/create-poll'}
            className="w-full sm:w-auto"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 px-7 py-3.5 text-sm sm:text-base font-bold transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              Create a Poll
            </Button>
          </Link>

          <Link to="/explore" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              Explore Polls
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection
