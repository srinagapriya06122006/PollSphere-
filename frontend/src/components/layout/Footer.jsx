import React from 'react'
import { Activity, ShieldCheck, Zap } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/60 py-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-200">PulsePoll</span> &copy; {new Date().getFullYear()} — Production Full-Stack Architecture
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Redis Pub/Sub</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebSockets</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>JWT Security</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
