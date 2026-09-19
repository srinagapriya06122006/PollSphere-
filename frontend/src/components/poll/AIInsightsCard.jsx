import React, { useState } from 'react'
import { Sparkles, Brain, TrendingUp, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react'
import apiClient from '../../api/client'

export const AIInsightsCard = ({ pollId, totalVotes }) => {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.post(`/polls/${pollId}/ai-insights`)
      setInsight(response.data)
    } catch (err) {
      setError(err.customMessage || 'Failed to generate AI insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 p-6 backdrop-blur-sm relative overflow-hidden transition-all shadow-sm">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Gemini AI Poll Insights
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deep statistical sentiment analysis and voter trend deductions
            </p>
          </div>
        </div>

        {!insight && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Voting Trends...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Generate Insights
              </>
            )}
          </button>
        )}

        {insight && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !insight && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Gemini is synthesizing vote distributions and generating strategic recommendations...
          </p>
        </div>
      )}

      {!insight && !loading && (
        <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
          Click <strong className="text-indigo-600 dark:text-indigo-400">Generate Insights</strong> to have Gemini analyze the live results, voter consensus, and key takeaways.
        </div>
      )}

      {insight && (
        <div className="mt-5 space-y-5 animate-fadeIn">
          {/* Executive Summary & Sentiment */}
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Executive Summary
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {insight.sentimentOverview}
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {insight.executiveSummary}
            </p>
          </div>

          {/* Key Takeaways */}
          {insight.keyTakeaways && insight.keyTakeaways.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Key Findings
              </h4>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {insight.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {insight.actionableRecommendations && insight.actionableRecommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Strategic Recommendations
              </h4>
              <div className="space-y-2">
                {insight.actionableRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-[10px] font-black text-amber-800 dark:text-amber-200 shrink-0">
                      #{idx + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIInsightsCard
