import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Copy, ExternalLink, Sparkles, Share2, PlusCircle, ArrowRight, X } from 'lucide-react'
import Button from '../common/Button'

export const CreatePollSuccessModal = ({ isOpen, onClose, pollId, question, onReset }) => {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  if (!isOpen || !pollId) return null

  const shareUrl = `${window.location.origin}/polls/${pollId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            🎉 Poll Published Successfully!
          </h2>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-sm mx-auto line-clamp-2">
            "{question}" is now live and ready to collect real-time responses.
          </p>
        </div>

        {/* Poll Meta & Share Link */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Shareable Direct Link
            </span>
            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">ID: {pollId.slice(-6).toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none select-all shadow-inner"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              onClose()
              if (onReset) onReset()
            }}
          >
            <PlusCircle className="w-4 h-4" />
            Create Another
          </Button>

          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              onClose()
              navigate(`/polls/${pollId}`)
            }}
          >
            View Live Poll <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreatePollSuccessModal
