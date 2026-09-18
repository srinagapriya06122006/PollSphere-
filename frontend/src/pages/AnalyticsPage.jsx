import React from 'react'
import { BarChart3, TrendingUp, Sparkles, PieChart, Activity, Database, Server, Radio } from 'lucide-react'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'
import Card from '../components/common/Card'

export const AnalyticsPage = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" /> Platform Intelligence & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time MongoDB aggregation pipelines, Redis voting velocity, category distributions, and audience engagement telemetry.
          </p>
        </div>
      </div>

      {/* Main Analytics Engine */}
      <AnalyticsDashboard />
    </div>
  )
}

export default AnalyticsPage
