import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, ArrowRight, CheckCircle2, PieChart, Calendar, Activity } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Card from '../common/Card'
import Button from '../common/Button'

export const AnalyticsPreview = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Description (~45% width) */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              Visual Analytics
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Turn Votes Into Insights
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Understand participation and response trends through clear visual analytics.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Participation trends</span>
              </li>
              <li className="flex items-center gap-2.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Category breakdowns</span>
              </li>
              <li className="flex items-center gap-2.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Poll response analysis</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to={isAuthenticated ? '/analytics' : '/login?redirect=/analytics'}>
                <Button variant="primary" size="md" className="flex items-center gap-2 mx-auto lg:mx-0 font-bold shadow-lg shadow-purple-600/20">
                  <span>Explore Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Static Preview Card (~55% width) */}
          <div className="lg:col-span-7 w-full">
            <Card className="p-5 sm:p-6 border-purple-100 dark:border-slate-800 shadow-md shadow-purple-950/5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Analytics Dashboard Preview
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  SAMPLE ANALYTICS PREVIEW
                </span>
              </div>

              {/* Sample Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-indigo-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Votes Per Day</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Daily Trend</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-purple-500">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Categories</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Segmented</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-emerald-500">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Engagement</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Sample Turnout</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-amber-500">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Poll Status</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Active Polls</span>
                </div>
              </div>

              {/* Static Representation of Category Distribution */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  Sample Category Distribution
                </span>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span>Technology</span>
                      <span className="font-bold">54%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[54%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span>Education</span>
                      <span className="font-bold">28%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full w-[28%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span>Community</span>
                      <span className="font-bold">18%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full w-[18%]" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsPreview
