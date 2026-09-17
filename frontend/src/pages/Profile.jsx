import React from 'react'
import { User, Mail, Calendar, ShieldCheck, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'

export const Profile = () => {
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <LoadingSpinner message="Fetching user profile..." />
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-950/50">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{user.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-500 uppercase font-semibold">Account Status</span>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Verified Authenticated User
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-500 uppercase font-semibold">Member Since</span>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button variant="danger" size="md" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Profile
