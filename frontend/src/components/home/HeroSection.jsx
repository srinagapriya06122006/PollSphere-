import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'
import LivePollPreview from './LivePollPreview'

export const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative w-full pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20 overflow-hidden">
      {/* Subtle background glow blobs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: ~55% width (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>REAL-TIME POLLING PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.12]">
              Your Opinions.{' '}
              <span className="block mt-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                Real-Time Insights.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Create live polls, collect instant responses, and discover what your community thinks — all in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={isAuthenticated ? '/create-poll' : '/login?redirect=/create-poll'}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 px-7 py-3.5 text-sm sm:text-base font-bold transition-all hover:scale-105"
                >
                  <span>Create a Poll</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <span>Explore Polls</span>
                </Button>
              </Link>
            </div>

            {/* 3 Small Trust Points */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time results</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Secure voting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No setup required</span>
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
