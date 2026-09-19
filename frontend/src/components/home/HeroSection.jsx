import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Compass, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

export const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative w-full min-h-[calc(100vh-64px)] flex flex-col justify-between pt-6 pb-4 sm:pt-8 sm:pb-6 lg:py-6 overflow-hidden">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: ~50% width (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left z-10">
            {/* Real-time Badge with Pulsing Green Beacon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE REAL-TIME POLLING PLATFORM</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.12]">
              Ask. Vote.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                See What People Think.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Create live polls, collect instant responses, and discover what your community thinks — all in real time with zero reload latency.
            </p>

            {/* Professional SaaS CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
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
                  Start Creating Polls
                </Button>
              </Link>

              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Compass className="w-4 h-4 text-indigo-500" />
                  Browse Community Polls
                </Button>
              </Link>
            </div>

            {/* Feature Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-1 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero setup required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time WebSocket sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Voter fraud protection</span>
              </div>
            </div>
          </div>

          {/* Right Column: ~50% width (lg:col-span-6) — Professional PollSphere Visual */}
          <div className="lg:col-span-6 flex items-center justify-center w-full relative">
            {/* Subtle ambient neon glow matching PollSphere theme */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-500/10 rounded-3xl blur-3xl -z-10 pointer-events-none" />

            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none flex items-center justify-center">
              <img
                src="/pollsphere-hero-mockup.png"
                alt="PollSphere Real-Time Polling Platform"
                className="w-full h-auto max-h-[460px] lg:max-h-[500px] object-contain rounded-2xl drop-shadow-[0_25px_50px_rgba(79,70,229,0.3)] select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator at bottom */}
      <div className="hidden lg:flex flex-col items-center justify-center pt-2 pb-1 text-slate-500 hover:text-slate-400 transition-colors pointer-events-none select-none">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500/80 mb-1">
          Scroll to explore
        </span>
        <div className="w-4 h-7 rounded-full border-2 border-slate-700/80 flex items-start justify-center p-0.5">
          <div className="w-1 h-2 rounded-full bg-indigo-500 animate-bounce" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
