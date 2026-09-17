import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, PlusCircle, User, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform duration-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              PulsePoll
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'text-emerald-400 bg-slate-900' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
            }`}
          >
            Dashboard
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-polls"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my-polls') ? 'text-emerald-400 bg-slate-900' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                }`}
              >
                My Polls
              </Link>
              <Link
                to="/create-poll"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hidden sm:flex items-center gap-1.5 ${
                  isActive('/create-poll') ? 'text-emerald-400 bg-slate-900' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Create Poll
              </Link>
            </>
          )}
        </nav>

        {/* User / Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
                  isActive('/profile')
                    ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold hidden md:inline-block max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                <span className="hidden sm:inline-block">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
