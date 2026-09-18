import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Users,
  ScrollText,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
} from 'lucide-react'
import apiClient from '../api/client'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('audit')
  const [auditLogs, setAuditLogs] = useState([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [logPage, setLogPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [userPage, setUserPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: logPage.toString(),
        limit: '20',
      })
      if (actionFilter) params.append('action', actionFilter)

      const res = await apiClient.get(`/admin/audit-logs?${params.toString()}`)
      setAuditLogs(res.data?.logs || [])
      setTotalLogs(res.data?.total || 0)
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/admin/users?page=${userPage}&limit=20`)
      setUsers(res.data?.users || [])
      setTotalUsers(res.data?.total || 0)
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch registered users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, logPage, userPage, actionFilter])

  const actionColors = {
    USER_REGISTER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    USER_LOGIN: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    POLL_CREATE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    POLL_UPDATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    POLL_DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    POLL_CLOSE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    POLL_EXPIRE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    VOTE_CAST: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }

  return (
    <div className="space-y-6 animate-fadeIn py-4">
      {/* Admin Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-100 via-amber-50 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 border border-amber-300 dark:border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Administrator Control Center
            </h1>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Platform governance, RBAC audit trails, and moderation controls.
            </p>
          </div>
        </div>

        <button
          onClick={() => (activeTab === 'audit' ? fetchAuditLogs() : fetchUsers())}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <ScrollText className="w-4 h-4" /> Live Audit Trails ({totalLogs})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Registered Users ({totalUsers})
        </button>
      </div>

      {/* Tab 1: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Action Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Action:
            </span>
            {['', 'USER_REGISTER', 'USER_LOGIN', 'POLL_CREATE', 'VOTE_CAST', 'POLL_EXPIRE', 'POLL_DELETE'].map(
              (act) => (
                <button
                  key={act}
                  onClick={() => {
                    setActionFilter(act)
                    setLogPage(1)
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    actionFilter === act
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {act || 'All Actions'}
                </button>
              )
            )}
          </div>

          {/* Audit Logs Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 uppercase font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Entity ID</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono font-bold">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap font-sans">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            actionColors[log.action] || 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-300 font-sans">{log.userEmail || 'System'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.entityId?.slice(0, 10)}...</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-300 font-sans max-w-xs truncate">
                        {log.details || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-sans">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500 font-sans">
                        No audit events recorded for this criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Users List */}
      {activeTab === 'users' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 uppercase font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-semibold">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{u.id}</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminDashboard
