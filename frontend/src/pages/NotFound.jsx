import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

export const NotFound = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <Card className="p-8 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-100">404</h1>
          <h2 className="text-lg font-semibold text-slate-300">Page Not Found</h2>
          <p className="text-xs text-slate-400">The poll or page you are looking for does not exist or has been moved.</p>
        </div>
        <Link to="/" className="inline-block">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default NotFound
