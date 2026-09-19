import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Radio, Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Footer = () => {
  const { isAuthenticated } = useAuth()

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Column (Col 1-2) */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-md shadow-indigo-600/20">
                <img
                  src="/pollsphere-logo.jpg"
                  alt="PollSphere"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-black font-['Outfit',sans-serif] text-slate-900 dark:text-slate-100 tracking-tight">
                  PollSphere
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  Real-Time Polling & Analytics
                </p>
              </div>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-sm">
              High-concurrency live polling platform powered by Go, Gin, WebSockets, Redis Pub/Sub, and React.
            </p>

            {/* Authentic Live System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational • Real-Time Engine Active</span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Product
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Explore Polls
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthenticated ? '/create-poll' : '/login?redirect=/create-poll'}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Create a Poll
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthenticated ? '/analytics' : '/login?redirect=/analytics'}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Resources
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/srinagapriya06122006/PollSphere-#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/srinagapriya06122006/PollSphere-#-system-architecture"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Project Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Project
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="https://github.com/srinagapriya06122006/PollSphere-"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  About PollSphere
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <p>&copy; {new Date().getFullYear()} PollSphere. Open-source enterprise polling platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for real-time consensus
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
