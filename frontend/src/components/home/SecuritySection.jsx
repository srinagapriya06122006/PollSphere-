import React from 'react'
import {
  ShieldCheck,
  KeyRound,
  Lock,
  UserCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import Card from '../common/Card'

export const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: KeyRound,
      title: 'JWT Authentication',
      description: 'HMAC-SHA256 cryptographically signed tokens with automated session expiration.',
    },
    {
      icon: ShieldCheck,
      title: 'Google OAuth 2.0',
      description: 'Zero-credential storage via Google Identity Services token verification.',
    },
    {
      icon: Lock,
      title: 'bcrypt Password Hashing',
      description: 'Adaptive key derivation (cost 10) for secure local password storage.',
    },
    {
      icon: UserCheck,
      title: 'Role-Based Access Control',
      description: 'Granular admin and user permission separation enforced on all protected routes.',
    },
    {
      icon: Zap,
      title: 'Sliding-Window Rate Limiter',
      description: 'Redis-backed 120 req/minute rate limiting preventing API abuse and DDoS.',
    },
    {
      icon: CheckCircle2,
      title: 'Duplicate-Vote Protection',
      description: 'MongoDB compound unique index { poll_id: 1, user_id: 1 } guaranteeing single voting.',
    },
  ]

  return (
    <section className="w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual Shield & Headline (~45% width) */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security Architecture
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Secure by Design
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Every vote, token, and API interaction is protected using defense-in-depth engineering principles.
            </p>

            {/* Central Security Shield Graphic */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Engineered Integrity
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Guaranteed Atomic Uniqueness
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Security Capabilities Grid (~55% width) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecuritySection
