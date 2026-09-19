import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  X,
  Compass,
  Vote,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  Sparkles,
} from 'lucide-react'
import Button from '../common/Button'

export const PollPreviewModal = ({ isOpen, onClose, poll }) => {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState(null)

  if (!isOpen || !poll) return null

  const categoryIcons = {
    technology: '💻',
    education: '🎓',
    sports: '⚽',
    entertainment: '🎬',
    general: '🌐',
  }

  const getExpiryText = () => {
    if (!poll.expires_at) return null
    const exp = new Date(poll.expires_at)
    const now = new Date()
    const diff = exp - now
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h left`
    return `${Math.floor(hours / 24)}d left`
  }

  const handleVoteNow = () => {
    onClose()
    navigate(`/polls/${poll.id}`, { state: { preselectedOption: selectedOption } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/40 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badges & Close */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <span>{categoryIcons[poll.category] || '🌐'}</span>
              <span>{poll.category || 'General'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              LIVE
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Title */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Poll Question
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1 leading-snug">
            {poll.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Select an option to vote:
          </p>
          {poll.options.map((opt) => {
            const isSelected = selectedOption === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={`w-full text-left p-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-150 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-400 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="truncate">{opt.text}</span>
                </div>

                {opt.votes !== undefined && (
                  <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 ml-2">
                    {opt.votes} votes
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Poll Metadata Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {poll.creator_name || 'Community Member'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {poll.total_votes !== undefined && (
              <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <Vote className="w-3.5 h-3.5 text-indigo-500" />
                {poll.total_votes} votes
              </span>
            )}
            {getExpiryText() && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Hourglass className="w-3.5 h-3.5" />
                {getExpiryText()}
              </span>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleVoteNow}
            className="flex items-center gap-1.5 font-bold shadow-lg shadow-indigo-600/20"
          >
            <span>Vote Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PollPreviewModal
