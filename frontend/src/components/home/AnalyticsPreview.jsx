import React from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  PieChart as PieIcon,
  Calendar,
  Activity,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import Card from '../common/Card'
import Button from '../common/Button'

export const AnalyticsPreview = () => {
  const { isAuthenticated } = useAuth()

  // Sample data clearly labeled as preview
  const weeklyTrends = [
    { day: 'Mon', votes: 45 },
    { day: 'Tue', votes: 78 },
    { day: 'Wed', votes: 62 },
    { day: 'Thu', votes: 110 },
    { day: 'Fri', votes: 145 },
    { day: 'Sat', votes: 95 },
    { day: 'Sun', votes: 130 },
  ]

  const categoryData = [
    { name: 'Tech', value: 48, color: '#6366f1' },
    { name: 'Education', value: 26, color: '#a855f7' },
    { name: 'Community', value: 16, color: '#ec4899' },
    { name: 'General', value: 10, color: '#10b981' },
  ]

  return (
    <section className="w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Description (~42% width) */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              Visual Analytics
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Turn Votes Into Insights
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Understand participation, response trends, and poll performance through clear visual analytics.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Daily & weekly vote trajectory charts</span>
              </li>
              <li className="flex items-center gap-2.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Segmented category distribution breakdowns</span>
              </li>
              <li className="flex items-center gap-2.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Real-time turnout & community engagement metrics</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to={isAuthenticated ? '/analytics' : '/login?redirect=/analytics'}>
                <Button
                  variant="primary"
                  size="md"
                  className="flex items-center gap-2 mx-auto lg:mx-0 font-bold shadow-lg shadow-purple-600/20"
                >
                  <span>Explore Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Dashboard-Style Preview Card (~58% width) */}
          <div className="lg:col-span-7 w-full">
            <Card className="p-5 sm:p-6 border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-950/5 space-y-5">
              {/* Header with clear sample badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Live Analytics Dashboard
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200/70 dark:border-indigo-800/70">
                  Analytics Preview
                </span>
              </div>

              {/* Top Metric Cards: Votes, Categories, Participation, Poll Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-indigo-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Votes</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Live Trend</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-purple-500">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Categories</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Distribution</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-emerald-500">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Participation</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Turnout</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="flex justify-center mb-1 text-amber-500">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Poll Status</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">Active</span>
                </div>
              </div>

              {/* Recharts Visual Charts Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
                {/* Weekly Trend Chart (sm:col-span-7) */}
                <div className="sm:col-span-7 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                    Votes Activity (Weekly Trend)
                  </span>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyTrends} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            fontSize: '11px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="votes"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#areaGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Donut Distribution (sm:col-span-5) */}
                <div className="sm:col-span-5 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Category Breakdown
                  </span>
                  <div className="h-28 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={26}
                          outerRadius={42}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Tech
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Edu
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Community
                    </span>
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
