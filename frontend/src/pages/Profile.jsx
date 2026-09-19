import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  LogOut,
  Vote,
  BarChart3,
  Award,
  KeyRound,
  History,
  CheckCircle2,
  Lock,
  Edit3,
  AlertCircle,
  ExternalLink,
  Activity,
  PlusCircle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import LoadingSpinner from '../components/common/LoadingSpinner'

export const getInitials = (name, email) => {
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
  return 'SJ'
}

export const Profile = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState(null)
  const [voteHistory, setVoteHistory] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit profile state
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchProfileDetails = async () => {
    try {
      setLoading(true)
      const [profileRes, votesRes, timelineRes] = await Promise.all([
        apiClient.get('/users/profile'),
        apiClient.get('/users/votes'),
        apiClient.get('/users/timeline').catch(() => ({ data: { timeline: [] } })),
      ])
      setProfileData(profileRes.data)
      setVoteHistory(votesRes.data?.votes || [])
      setTimeline(timelineRes.data?.timeline || [])
      if (profileRes.data?.user?.name) {
        setName(profileRes.data.user.name)
      }
    } catch (err) {
      console.error('Failed to load profile stats', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileDetails()

    const handleAuthChange = () => {
      fetchProfileDetails()
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => window.removeEventListener('auth-change', handleAuthChange)
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    setError('')
    setMessage('')

    try {
      const payload = {}
      if (name.trim()) payload.name = name.trim()
      if (newPassword) {
        if (!currentPassword) {
          setError('Current password is required to set a new password')
          setSaveLoading(false)
          return
        }
        payload.current_password = currentPassword
        payload.new_password = newPassword
      }

      await apiClient.put('/users/profile', payload)
      setMessage('Profile updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      fetchProfileDetails()
      setTimeout(() => setMessage(''), 3500)
    } catch (err) {
      setError(err.customMessage || 'Failed to update profile')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <LoadingSpinner message="Fetching user metrics & history..." />

  const stats = profileData?.stats || { pollsCreated: 0, votesCast: 0, votesReceived: 0 }
  const currentUser = profileData?.user || user
  const initials = getInitials(currentUser?.name, currentUser?.email)

  const categoryIcons = {
    technology: '💻',
    education: '🎓',
    sports: '⚽',
    entertainment: '🎬',
    general: '🌐',
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn">
      {/* Profile Header Card */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {/* Profile Avatar or 2-Letter Uppercase Initials Badge */}
            {currentUser?.profile_image ? (
              <img
                src={currentUser.profile_image}
                alt={currentUser.name || 'User'}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4 ring-indigo-500/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-950/20 ring-4 ring-indigo-500/20 tracking-wider">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{currentUser?.name || 'User Profile'}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  {currentUser?.role || 'Member'}
                </span>
                {currentUser?.auth_provider === 'google' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    Google Account
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {currentUser?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Joined {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'September 2026'}
                </span>
              </div>
            </div>
          </div>

          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
          </Button>
        </div>

        {/* Activity Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Polls Created</span>
              <BarChart3 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.pollsCreated}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Votes Cast</span>
              <Vote className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.votesCast}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Votes Received</span>
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.votesReceived}</div>
          </div>
        </div>

        {/* Achievement Badges Showcase */}
        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Achievement Badges
            </h4>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {[
                true,
                stats.votesCast >= 1,
                stats.pollsCreated >= 1,
                stats.votesReceived >= 1,
                stats.votesCast >= 3,
              ].filter(Boolean).length} of 5 Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Badge 1: Early Pioneer */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 text-center space-y-1 shadow-sm">
              <div className="text-xl">🚀</div>
              <p className="text-[11px] font-black text-slate-900 dark:text-slate-100">Pioneer</p>
              <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                Unlocked
              </span>
            </div>

            {/* Badge 2: Active Voter */}
            <div className={`p-3 rounded-2xl text-center space-y-1 transition ${
              stats.votesCast >= 1
                ? 'bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 shadow-sm'
                : 'bg-slate-100/60 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="text-xl">{stats.votesCast >= 1 ? '🗳️' : '🔒'}</div>
              <p className="text-[11px] font-black text-slate-900 dark:text-slate-100">Voter</p>
              <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                stats.votesCast >= 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {stats.votesCast >= 1 ? 'Unlocked' : '1+ Vote'}
              </span>
            </div>

            {/* Badge 3: Poll Creator */}
            <div className={`p-3 rounded-2xl text-center space-y-1 transition ${
              stats.pollsCreated >= 1
                ? 'bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 shadow-sm'
                : 'bg-slate-100/60 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="text-xl">{stats.pollsCreated >= 1 ? '💡' : '🔒'}</div>
              <p className="text-[11px] font-black text-slate-900 dark:text-slate-100">Creator</p>
              <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                stats.pollsCreated >= 1
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {stats.pollsCreated >= 1 ? 'Unlocked' : '1+ Poll'}
              </span>
            </div>

            {/* Badge 4: Influencer */}
            <div className={`p-3 rounded-2xl text-center space-y-1 transition ${
              stats.votesReceived >= 1
                ? 'bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 shadow-sm'
                : 'bg-slate-100/60 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="text-xl">{stats.votesReceived >= 1 ? '🌟' : '🔒'}</div>
              <p className="text-[11px] font-black text-slate-900 dark:text-slate-100">Influencer</p>
              <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                stats.votesReceived >= 1
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {stats.votesReceived >= 1 ? 'Unlocked' : '1+ Recv'}
              </span>
            </div>

            {/* Badge 5: Power Voter */}
            <div className={`p-3 rounded-2xl text-center space-y-1 transition ${
              stats.votesCast >= 3
                ? 'bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 shadow-sm'
                : 'bg-slate-100/60 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="text-xl">{stats.votesCast >= 3 ? '⚡' : '🔒'}</div>
              <p className="text-[11px] font-black text-slate-900 dark:text-slate-100">Powerhouse</p>
              <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                stats.votesCast >= 3
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {stats.votesCast >= 3 ? 'Unlocked' : '3+ Votes'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Voting History ({voteHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Activity Timeline ({timeline.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Account Settings
        </button>
      </div>

      {/* Tab 1: Voting History */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {voteHistory.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Vote className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">No Votes Cast Yet</h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Explore the dashboard to discover active polls and cast your vote in real time.
              </p>
              <Link to="/" className="inline-block mt-2">
                <Button variant="outline" size="sm">
                  Explore Community Polls
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {voteHistory.map((item) => (
                <div
                  key={item.voteId}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                        {categoryIcons[item.category] || '🌐'} {item.category}
                      </span>
                      <span className="text-slate-500 font-semibold text-[11px]">
                        {new Date(item.votedAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.question}</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Your choice: <strong className="text-slate-900 dark:text-white font-extrabold">{item.optionText}</strong>
                    </p>
                  </div>

                  <Link
                    to={`/polls/${item.pollId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0 transition"
                  >
                    View Live Results <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Activity Timeline */}
      {activeTab === 'timeline' && (
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Activity Timeline</h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chronological history of polls created and votes cast</p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{timeline.length} events</span>
          </div>

          {timeline.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              No timeline activities recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timeline.map((event, idx) => {
                const isPollCreate = event.type === 'POLL_CREATED'
                const isVote = event.type === 'VOTE_CAST'
                const isClose = event.type === 'POLL_CLOSED'

                return (
                  <div key={event.id || idx} className="relative group">
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                        isPollCreate
                          ? 'bg-indigo-500 text-white'
                          : isVote
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isPollCreate && <PlusCircle className="w-3 h-3" />}
                      {isVote && <Vote className="w-3 h-3" />}
                      {isClose && <XCircle className="w-3 h-3" />}
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-200">{event.title}</span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{event.description}</p>
                      {event.pollId && (
                        <Link
                          to={`/polls/${event.pollId}`}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold mt-2"
                        >
                          Go to Poll <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Account Settings */}
      {activeTab === 'settings' && (
        <Card className="p-8">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">Account & Security Settings</h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
            Modify your profile display name or update your account password.
          </p>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
            <Input
              label="Display Name"
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Change Password
              </h4>

              <Input
                label="Current Password"
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only to change password"
              />

              <Input
                label="New Password"
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" isLoading={saveLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

export default Profile
