import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Github, Mail, ShieldCheck, Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Footer = () => {
  const { isAuthenticated } = useAuth()

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand & Mission (Col 1-2 on mobile, Col 1 on desktop) */}
          <div className="col-span-2 space-y-4">
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
              The high-performance, real-time polling platform designed for communities, classrooms, and modern engineering teams.
            </p>

            {/* Live System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational • 99.9% Uptime</span>
            </div>
          </div>

          {/* Product Links */}
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
                  to={isAuthenticated ? '/analytics' : '/login?redirect=/analytics'}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Live Analytics
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
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Resources
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Documentation
                </a>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  WebSocket & REST API
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Community FAQ
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Architecture Overview
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Release Notes (v2.4)
                </span>
              </li>
            </ul>
          </div>

          {/* Community & Code Links */}
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
                <a
                  href="https://github.com/srinagapriya06122006"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                >
                  Developer Profile
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/srinagapriya06122006/PollSphere-/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                >
                  Issues & Feedback
                </a>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  MIT License
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} PollSphere. All rights reserved.</p>

          {/* Subtle Ownership Credit */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Designed &amp; Developed by</span>
            <a
              href="https://github.com/srinagapriya06122006"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 hover:underline underline-offset-2"
            >
              <span>Srinagapriya A</span>
              <Github className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for real-time consensus</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
