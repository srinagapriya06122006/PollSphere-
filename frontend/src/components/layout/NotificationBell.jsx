import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, Info, Clock, Trash2, Check, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export const NotificationBell = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const res = await apiClient.get('/notifications?limit=25')
      if (res.data) {
        setNotifications(res.data.notifications || [])
        setUnreadCount(res.data.unreadCount || 0)
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000) // 20s polling for background events
    return () => clearInterval(interval)
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for custom window event or WebSocket broadcast events
  useEffect(() => {
    const handleCustomNotification = (e) => {
      if (e.detail) {
        const newNotif = {
          id: Date.now().toString(),
          title: e.detail.title || 'Live Update',
          message: e.detail.message || '',
          created_at: new Date().toISOString(),
          is_read: false,
          type: e.detail.type || 'info',
          link: e.detail.link || '',
        }
        setNotifications((prev) => [newNotif, ...prev.slice(0, 24)])
        setUnreadCount((c) => c + 1)
      }
    }

    window.addEventListener('live-notification', handleCustomNotification)
    return () => window.removeEventListener('live-notification', handleCustomNotification)
  }, [])

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const markSingleAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await apiClient.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const deleteNotification = async (id, e) => {
    e.stopPropagation()
    try {
      await apiClient.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const formatTime = (ts) => {
    if (!ts) return 'Just now'
    const d = new Date(ts)
    const diff = Math.floor((new Date() - d) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        title="Live Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-fadeIn">
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Notifications {unreadCount > 0 && `(${unreadCount} new)`}
              </h4>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold transition"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition group ${
                    !n.is_read
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      !n.is_read
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5" /> {formatTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-medium"
                      >
                        View Details <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={(e) => markSingleAsRead(n.id, e)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                {loading ? 'Loading notifications...' : 'No notifications yet.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell

