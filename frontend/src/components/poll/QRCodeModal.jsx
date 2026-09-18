import React, { useState } from 'react'
import { X, Copy, Check, Share2, Download, ExternalLink } from 'lucide-react'
import QRCodeSVG from '../common/QRCodeSVG'

export const QRCodeModal = ({ isOpen, onClose, pollId, question }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/polls/${pollId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownload = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}&margin=15`
    window.open(qrUrl, '_blank')
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Vote on this live poll: "${question}"\n${shareUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(`Vote on this live poll: "${question}"`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Share Live Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center my-6">
          <QRCodeSVG value={shareUrl} size={180} />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs font-medium">
            Scan with any phone camera to vote instantly in real time
          </p>
        </div>

        {/* Link input */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Direct Voting Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Quick Share
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition"
            >
              <span className="font-bold">WhatsApp</span>
            </button>
            <button
              onClick={shareTwitter}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-medium transition"
            >
              <span className="font-bold">Twitter</span>
            </button>
            <button
              onClick={shareLinkedIn}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition"
            >
              <span className="font-bold">LinkedIn</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5 mb-0.5" />
              <span>QR Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal
