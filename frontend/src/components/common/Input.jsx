import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export const Input = ({
  label,
  error,
  isValid,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          className={`w-full rounded-xl bg-white dark:bg-slate-900 border px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none shadow-sm ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 pr-10'
              : isValid
              ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 pr-10'
              : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          } ${className}`}
          {...props}
        />

        {/* Validation Status Indicator Icons */}
        {error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        {!error && isValid && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Input
