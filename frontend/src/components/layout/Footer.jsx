import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Brand & Tagline */}
          <div className="space-y-2.5 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-slate-900 dark:text-slate-100">PulsePoll</span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Real-time audience feedback made simple.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Product
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
                  Explore Polls
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/create-poll" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
                  Create Poll
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Account
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Technology
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <li>Go</li>
              <li>MongoDB</li>
              <li>Redis</li>
              <li>WebSocket</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <p>&copy; 2026 PulsePoll</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
