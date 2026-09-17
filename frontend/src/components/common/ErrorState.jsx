import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import Button from './Button'

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`glass-card rounded-2xl p-8 text-center max-w-md mx-auto my-8 border-rose-500/20 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mx-auto">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  )
}

export default ErrorState
