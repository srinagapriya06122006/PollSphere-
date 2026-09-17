import React from 'react'
import { RotateCcw } from 'lucide-react'

export const LiveStatusBadge = ({ status = 'connecting', onRetry }) => {
  const configs = {
    connected: {
      bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400 animate-pulse',
      label: 'Live Real-Time Sync',
    },
    connecting: {
      bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400 animate-ping',
      label: 'Connecting...',
    },
    reconnecting: {
      bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400 animate-pulse',
      label: 'Reconnecting...',
    },
    disconnected: {
      bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-400',
      label: 'Offline',
    },
  }

  const current = configs[status] || configs.connecting

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bgColor}`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dotColor}`} />
        {current.label}
      </span>

      {status === 'disconnected' && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reconnect
        </button>
      )}
    </div>
  )
}

export default LiveStatusBadge
