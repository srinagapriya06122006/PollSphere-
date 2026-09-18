import React, { useState } from 'react'
import { CheckCircle2, RotateCcw, Sparkles, Zap, Users } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'

export const InteractivePollDemo = () => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Curated demo data as requested
  const baseVotes = {
    python: 43,
    javascript: 32,
    go: 19,
    java: 9,
  }

  const [votes, setVotes] = useState(baseVotes)

  const options = [
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'javascript', label: 'JavaScript / TypeScript', icon: '⚡' },
    { id: 'go', label: 'Go', icon: '🐹' },
    { id: 'java', label: 'Java / Kotlin', icon: '☕' },
  ]

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

  const handleVote = (id) => {
    if (hasVoted) return
    setSelectedOption(id)
    setVotes((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }))
    setHasVoted(true)
  }

  const handleReset = () => {
    setSelectedOption(null)
    setHasVoted(false)
    setVotes(baseVotes)
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Interactive Demo
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Try a Live Poll
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Test the voting experience right now. No account or installation required.
          </p>
        </div>

        {/* Demo Poll Card */}
        <Card className="p-5 sm:p-7 border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-950/5">
          {/* Question Header */}
          <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Sample Question
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Which programming language do you use most?
              </h3>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5" />
              <span>{totalVotes} responded</span>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {options.map((opt) => {
              const count = votes[opt.id]
              const percentage = Math.round((count / totalVotes) * 100)
              const isSelected = selectedOption === opt.id

              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={hasVoted}
                  className={`w-full relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-300 border ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                      : hasVoted
                      ? 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-sm cursor-pointer'
                  }`}
                >
                  {/* Result Fill Bar when Voted */}
                  {hasVoted && (
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-2xl ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 dark:from-indigo-600/35 dark:to-purple-600/35'
                          : 'bg-slate-200/50 dark:bg-slate-800/50'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  {/* Content Overlay */}
                  <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{opt.icon}</span>
                      <span
                        className={`font-bold truncate ${
                          isSelected
                            ? 'text-indigo-900 dark:text-indigo-200'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </div>

                    {hasVoted ? (
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {count} votes
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-black ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                        Vote
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* After Voting State */}
          {hasVoted ? (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold justify-center sm:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Thanks for voting!</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-center sm:justify-start">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Results update in real time for all active participants</span>
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Vote Again</span>
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-slate-400 text-center font-medium">
              Click any option above to see how live results appear
            </p>
          )}
        </Card>
      </div>
    </section>
  )
}

export default InteractivePollDemo
