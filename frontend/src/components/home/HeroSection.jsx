import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Compass, CheckCircle2, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'
import LivePollPreview from './LivePollPreview'

export const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="w-full pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: ~55% width (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>REAL-TIME POLLING MADE SIMPLE</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.12]">
              Ask. Vote.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                See What People Think.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Create live polls, collect instant responses, and discover what your community thinks — all in real time.
            </p>

            {/* Functional CTA Buttons with Auth-Aware & Public Routing */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={isAuthenticated ? '/create-poll' : '/login?redirect=/create-poll'}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 px-7 py-3.5 text-sm sm:text-base font-bold"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Poll
                </Button>
              </Link>

              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold"
                >
                  <Compass className="w-4 h-4 text-indigo-500" />
                  Explore Polls
                </Button>
              </Link>
            </div>

            {/* Feature Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Easy to create</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time voting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant results</span>
              </div>
            </div>
          </div>

          {/* Right Column: ~45% width (lg:col-span-5) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <LivePollPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
