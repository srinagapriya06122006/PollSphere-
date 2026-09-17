import React from 'react'
import { Inbox, Plus } from 'lucide-react'
import Button from './Button'

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`glass-card rounded-2xl p-10 text-center max-w-md mx-auto my-8 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-slate-700">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mx-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
