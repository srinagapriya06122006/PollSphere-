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
        <label htmlFor={id} className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl bg-white dark:bg-slate-900 border px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40' : 'border-slate-300 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-bold text-rose-500 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">{helperText}</p>}
    </div>
  )
}

export default Input
