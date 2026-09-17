import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../common/Button'

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
        Page <span className="text-emerald-400 font-bold">{page}</span> of {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

export default Pagination
