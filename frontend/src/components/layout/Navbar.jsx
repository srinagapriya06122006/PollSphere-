import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart3,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Sun,
  Moon,
  Compass,
  Trophy,
  User,
  History,
  Settings,
  ChevronDown,
  TrendingUp,
  Menu,
  X,
  Sparkles,
  HelpCircle,
  Layers,
  LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Button from '../common/Button'
import NotificationBell from './NotificationBell'

export const getNavInitials = (name, email) => {
  if (name && typeof name === 'string' && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0].toUpperCase()
    }
  }
  if (email && typeof email === 'string' && email.trim().length > 0) {
    return email.slice(0, 2).toUpperCase()
  }
  return 'PP'
}

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    setProfileDropdownOpen(false)
    setMobileMenuOpen(false)
    logout()
    navigate('/login')
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path
  const userInitials = getNavInitials(user?.name, user?.email)

  const scrollToAnchor = (anchorId) => {
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate(`/#${anchorId}`)
    } else {
      window.history.pushState(null, '', `/#${anchorId}`)
      const el = document.getElementById(anchorId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-950/20 group-hover:scale-105 transition-transform duration-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent">
              PulsePoll
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Live Real-Time
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
          {isAuthenticated ? (
            /* Logged-In Navigation */
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              <Link
                to="/explore"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/explore')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Explore Polls
              </Link>

              <Link
                to="/analytics"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/analytics')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Analytics
              </Link>

              <Link
                to="/leaderboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/leaderboard')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Leaderboard
              </Link>

              <Link
                to="/my-polls"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive('/my-polls')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                My Polls
              </Link>

              <Link
                to="/create-poll"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/create-poll')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create Poll
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30'
                      : 'text-amber-600/80 dark:text-amber-400/80 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </>
          ) : (
            /* Unauthenticated Visitor Navigation */
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive('/')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                Home
              </Link>

              <Link
                to="/explore"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/explore')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Explore Polls
              </Link>

              <button
                type="button"
                onClick={() => scrollToAnchor('how-it-works')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
              >
                How It Works
              </button>

              <button
                type="button"
                onClick={() => scrollToAnchor('features')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
              >
                Features
              </button>
            </>
          )}
        </nav>

        {/* Right Actions: Theme Switcher + Notifications + Auth / Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-transparent dark:hover:border-slate-800 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Notifications (only if logged in) */}
          {isAuthenticated && <NotificationBell />}

          {/* Authenticated Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                  profileDropdownOpen || isActive('/profile')
                    ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-sm tracking-wide">
                  {userInitials}
                </div>
                <span className="text-xs font-semibold max-w-[100px] truncate text-slate-800 dark:text-slate-200">
                  {user.name || user.email}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || 'Account'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {user.role || 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-1.5 text-xs">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>User Profile</span>
                    </Link>

                    <Link
                      to="/my-polls"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span>My Published Polls</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                      <span>Dashboard & Telemetry</span>
                    </Link>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Buttons */
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
              <Link to="/login?redirect=/create-poll">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Create a Poll
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {isAuthenticated ? (
            /* Mobile Logged-in Links */
            <div className="space-y-1.5 text-sm font-semibold">
              <div className="px-3 py-2 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || user?.email}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/explore"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Compass className="w-4 h-4 text-purple-500" />
                <span>Explore Polls</span>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Analytics</span>
              </Link>

              <Link
                to="/leaderboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </Link>

              <Link
                to="/my-polls"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span>My Polls</span>
              </Link>

              <Link
                to="/create-poll"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Poll</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Profile & Settings</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mobile Unauthenticated Links */
            <div className="space-y-2 text-sm font-semibold">
              <Link
                to="/"
                className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Home
              </Link>
              <Link
                to="/explore"
                className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Explore Polls
              </Link>
              <button
                type="button"
                onClick={() => scrollToAnchor('how-it-works')}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToAnchor('features')}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Features
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/login?redirect=/create-poll">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Create a Poll
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
