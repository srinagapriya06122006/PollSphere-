import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Send, User, Clock, AlertCircle, RefreshCw, LogIn } from 'lucide-react'
import apiClient from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'
import Card from '../common/Card'

export const PollComments = ({ pollId }) => {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')

  const fetchComments = async () => {
    if (!pollId) return
    try {
      setLoading(true)
      const res = await apiClient.get(`/polls/${pollId}/comments`)
      setComments(res.data?.comments || [])
    } catch (err) {
      console.error('Failed to load comments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [pollId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      setSubmitting(true)
      setError('')
      const res = await apiClient.post(`/polls/${pollId}/comments`, {
        content: commentText.trim(),
      })

      if (res.data?.comment) {
        setComments((prev) => [res.data.comment, ...prev])
        setCommentText('')
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name, email) => {
    const val = name || email || 'User'
    return val.slice(0, 2).toUpperCase()
  }

  return (
    <Card className="p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Community Discussion
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Share your perspective, rationale, or debate options with other voters
            </p>
          </div>
        </div>

        <button
          onClick={fetchComments}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold flex items-center gap-1.5"
          title="Refresh comments"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Comment Input Box */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What made you choose this option? Add your reasoning..."
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-inner resize-none"
            />
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-bold text-slate-400">
                {commentText.length}/500 characters
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !commentText.trim()}
                isLoading={submitting}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Post Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-black text-slate-900 dark:text-slate-100">Want to join the conversation?</p>
            <p className="font-semibold text-slate-600 dark:text-slate-400">Sign in to leave a comment or discuss vote outcomes.</p>
          </div>
          <Link to="/login">
            <Button variant="primary" size="sm">
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In to Discuss
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3.5 pt-2">
        {loading && comments.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
            Loading discussions...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">No discussion entries yet</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Be the first to share your thoughts and reasoning on this poll!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {getInitials(comment.userName, comment.userEmail)}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {comment.userName || comment.userEmail || 'Community Voter'}
                    </h5>
                    <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-10 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

export default PollComments
