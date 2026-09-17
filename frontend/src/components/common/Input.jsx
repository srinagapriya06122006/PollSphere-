import React from 'react'

export const Input = ({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl bg-slate-900/90 border px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
          error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/40' : 'border-slate-800'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  )
}

export default Input
