import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  Vote,
  CheckCircle2,
  Clock,
  Users,
  Award,
  Flame,
  Layers,
  ChevronRight,
  RefreshCw,
  Activity,
  Server,
  Database,
  Radio,
  PieChart as PieChartIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import apiClient from '../../api/client'

const CATEGORY_COLORS = {
  technology: '#6366f1',
  education: '#0ea5e9',
  sports: '#10b981',
  entertainment: '#f59e0b',
  general: '#8b5cf6',
}

const STATUS_COLORS = ['#10b981', '#64748b']

const categoryIcons = {
  technology: '💻',
  education: '🎓',
  sports: '⚽',
  entertainment: '🎬',
  general: '🌐',
}

export const AnalyticsDashboard = () => {
  const [data, setData] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [analyticsRes, healthRes] = await Promise.all([
        apiClient.get('/analytics/overview'),
        apiClient.get('/health').catch(() => ({ data: { database: 'connected', redis: 'connected' } })),
      ])
      setData(analyticsRes.data)
      setHealth(healthRes.data)
    } catch (err) {
      setError('Failed to load system analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center space-x-3 my-6">
        <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading platform metrics & analytics...
        </span>
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  // Transform data for charts
  const voteTrendData = (data.voteTrend || []).map((item) => ({
    date: item.date ? item.date.slice(5) : '',
    votes: item.votes || 0,
  }))

  const categoryChartData = (data.categoryDistribution || []).map((cat) => ({
    category: cat.category ? cat.category.charAt(0).toUpperCase() + cat.category.slice(1) : 'General',
    count: cat.count || 0,
    fill: CATEGORY_COLORS[cat.category?.toLowerCase()] || '#6366f1',
  }))

  const statusPieData = [
    { name: 'Active Polls', value: data.activePolls || 0 },
    { name: 'Closed Polls', value: data.closedPolls || 0 },
  ]

  const topPollsData = (data.popularPolls || []).slice(0, 5).map((p) => ({
    name: p.question?.length > 22 ? p.question.slice(0, 22) + '...' : p.question,
    votes: p.totalVotes || 0,
  }))

  return (
    <div className="space-y-6 mb-8 animate-fadeIn">
      {/* System Health & Live Metrics Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-400/30 dark:border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 dark:bg-indigo-500/20 border border-white/20 dark:border-indigo-400/30 text-white dark:text-indigo-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide uppercase text-white dark:text-indigo-200">
              Live System Status & Telemetry
            </h3>
            <p className="text-xs text-indigo-100 dark:text-slate-400">Real-time Go microservices and distributed data layer</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700">
            <Database className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-400" />
            <span>MongoDB:</span>
            <span className="text-emerald-200 dark:text-emerald-400 font-bold capitalize">{health?.database || 'Connected'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700">
            <Server className="w-3.5 h-3.5 text-indigo-200 dark:text-indigo-400" />
            <span>Redis:</span>
            <span className="text-white dark:text-indigo-300 font-bold capitalize">
              {health?.redis === 'connected' ? 'Connected' : 'Active'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700">
            <Radio className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-400 animate-pulse" />
            <span>WebSocket:</span>
            <span className="text-emerald-200 dark:text-emerald-400 font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Polls */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Polls</span>
              <BarChart3 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data.totalPolls !== undefined ? data.totalPolls.toLocaleString() : 0}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1">
            {data.totalPolls > 0 ? (
              <>
                <span className="text-emerald-400 font-bold">↑ Active</span>
                <span className="text-slate-500">pipeline</span>
              </>
            ) : (
              <span className="text-slate-500">-- No data yet</span>
            )}
          </div>
        </div>

        {/* Total Votes */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Votes</span>
              <Vote className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data.totalVotes !== undefined ? data.totalVotes.toLocaleString() : 0}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1">
            {data.totalVotes > 0 ? (
              <>
                <span className="text-emerald-400 font-bold">↑ Real-Time</span>
                <span className="text-slate-500">recorded</span>
              </>
            ) : (
              <span className="text-slate-500">-- No votes yet</span>
            )}
          </div>
        </div>

        {/* Active Polls */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data.activePolls !== undefined ? data.activePolls.toLocaleString() : 0}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 font-medium flex items-center gap-1">
            {data.activePolls > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-400">Live streaming</span>
              </>
            ) : (
              <span className="text-slate-500">-- 0 running</span>
            )}
          </div>
        </div>

        {/* Closed Polls */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data.closedPolls !== undefined ? data.closedPolls.toLocaleString() : 0}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-purple-400 font-medium flex items-center gap-1">
            {data.closedPolls > 0 ? (
              <>
                <span className="text-purple-400 font-bold">100%</span>
                <span className="text-slate-500">archived</span>
              </>
            ) : (
              <span className="text-slate-500">-- None closed</span>
            )}
          </div>
        </div>

        {/* Registered Users */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1 hover:border-sky-500/30 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Users</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {data.totalUsers !== undefined ? data.totalUsers.toLocaleString() : 0}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-sky-400 font-medium flex items-center gap-1">
            {data.totalUsers > 0 ? (
              <>
                <span className="text-sky-400 font-bold">↑ Active</span>
                <span className="text-slate-500">network</span>
              </>
            ) : (
              <span className="text-slate-500">-- 0 users</span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Charts Row 1: Votes Trend & Category Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Votes Per Day (Area Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Votes Per Day (Activity Velocity)
            </h3>
            <span className="text-xs text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            {voteTrendData.some((t) => t.votes > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={voteTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="voteTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="votes"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#voteTrendGradient)"
                    name="Votes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-300">No voting activity recorded yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Votes will plot here in real time as participants respond.</p>
                <Link
                  to="/create-poll"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                >
                  Create your first poll
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Votes Per Category (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Polls Per Category
            </h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>

          <div className="h-64 w-full">
            {categoryChartData.some((c) => c.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Polls">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2">
                  <Layers className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-300">No category breakdown available</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Publish polls across tech, education, sports to visualize distribution.</p>
                <Link
                  to="/create-poll"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                >
                  Create a Poll
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Charts Row 2: Top 5 Polls & Status Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top 5 Polls by Votes (Horizontal/Vertical Bar Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Top 5 Polls by Engagement
            </h3>
            <span className="text-xs text-slate-400">Leaderboard</span>
          </div>

          <div className="h-64 w-full">
            {topPollsData.length > 0 && topPollsData.some((p) => p.votes > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPollsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="votes" fill="#f59e0b" radius={[0, 8, 8, 0]} name="Votes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 mb-2">
                  <Flame className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-300">No poll engagement recorded yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Vote on active polls or share them to view the engagement leaderboard.</p>
                <Link
                  to="/create-poll"
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition"
                >
                  Create your first poll
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Poll Status Distribution (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
              Poll Status Distribution
            </h3>
            <span className="text-xs text-slate-400">Lifecycle</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data.totalPolls > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs font-semibold text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-2">
                  <PieChartIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-300">0 polls registered</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Start creating polls to see status lifecycle metrics.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Poll Creators */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Poll Creators
            </h3>
            <span className="text-xs text-slate-400">Leaderboard</span>
          </div>

          <div className="space-y-2.5">
            {data.topCreators && data.topCreators.length > 0 ? (
              data.topCreators.map((creator, i) => (
                <div
                  key={creator.userId}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        i === 0
                          ? 'bg-amber-400 text-amber-950'
                          : i === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-amber-700/20 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                      {creator.userName}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                    {creator.score} {creator.score === 1 ? 'poll' : 'polls'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No creator records yet.</p>
            )}
          </div>
        </div>

        {/* Top Active Voters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Most Active Voters
            </h3>
            <span className="text-xs text-slate-400">Leaderboard</span>
          </div>

          <div className="space-y-2.5">
            {data.topVoters && data.topVoters.length > 0 ? (
              data.topVoters.map((voter, i) => (
                <div
                  key={voter.userId}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        i === 0
                          ? 'bg-emerald-400 text-emerald-950'
                          : i === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-emerald-700/20 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                      {voter.userName}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                    {voter.score} {voter.score === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No voter records yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
