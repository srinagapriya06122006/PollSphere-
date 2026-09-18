import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Vote,
  Hourglass,
  Tag,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import pollService from '../services/pollService'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import CreatePollSuccessModal from '../components/poll/CreatePollSuccessModal'

export const CreatePoll = () => {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('technology')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [options, setOptions] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ])
  const [expiryOption, setExpiryOption] = useState('none') // 'none', '1h', '24h', '3d', '7d', 'custom'
  const [customExpiryHours, setCustomExpiryHours] = useState('24')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Success modal state
  const [createdPoll, setCreatedPoll] = useState(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Interactive Live Preview Simulation State
  const [previewSelectedOpt, setPreviewSelectedOpt] = useState(null)
  const [previewVotes, setPreviewVotes] = useState({})

  const categories = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'general', label: 'General', icon: '🌐' },
  ]

  const templates = [
    {
      title: 'Tech Stack Choice',
      category: 'technology',
      question: 'Which backend framework do you prefer for high-concurrency microservices?',
      options: ['Go (Golang)', 'Node.js / Express', 'Rust (Actix/Axum)', 'Python (FastAPI)'],
    },
    {
      title: 'Class Evaluation',
      category: 'education',
      question: 'How clearly was today’s distributed systems lecture delivered?',
      options: ['Crystal clear & engaging', 'Good, need more code examples', 'Average, need review session', 'Confusing topics'],
    },
    {
      title: 'Hackathon Event',
      category: 'general',
      question: 'Which project domain should our upcoming 24-hour hackathon focus on?',
      options: ['Generative AI & LLMs', 'Full-Stack Web3 & Fintech', 'Cloud Infrastructure & DevOps', 'HealthTech & Biotech'],
    },
    {
      title: 'Sprint Retrospective',
      category: 'technology',
      question: 'How satisfied are you with the sprint velocity and ticket deliverables?',
      options: ['Exceeded expectations', 'On track as planned', 'Minor blockers encountered', 'Major architectural hurdles'],
    },
    {
      title: 'Sports Championship',
      category: 'sports',
      question: 'Who will win the upcoming European Champions League final?',
      options: ['Real Madrid', 'Manchester City', 'Bayern Munich', 'Arsenal'],
    },
  ]

  const handleApplyTemplate = (tpl) => {
    setQuestion(tpl.question)
    setCategory(tpl.category)
    setOptions(tpl.options.map((opt, i) => ({ id: (i + 1).toString(), text: opt })))
    setPreviewSelectedOpt(null)
    setPreviewVotes({})
  }

  const handleAddOption = () => {
    if (options.length >= 8) return
    setOptions([...options, { id: Date.now().toString(), text: '' }])
  }

  const handleRemoveOption = (id) => {
    if (options.length <= 2) return
    setOptions(options.filter((o) => o.id !== id))
  }

  const handleOptionChange = (id, value) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text: value } : o)))
  }

  const handlePreviewVote = (optId) => {
    setPreviewSelectedOpt(optId)
    setPreviewVotes((prev) => ({
      ...prev,
      [optId]: (prev[optId] || 0) + 1,
    }))
  }

  const calculateExpiryTime = () => {
    if (expiryOption === 'none') return null
    const now = new Date()
    let hoursToAdd = 0
    if (expiryOption === '1h') hoursToAdd = 1
    else if (expiryOption === '24h') hoursToAdd = 24
    else if (expiryOption === '3d') hoursToAdd = 72
    else if (expiryOption === '7d') hoursToAdd = 168
    else if (expiryOption === 'custom') hoursToAdd = parseFloat(customExpiryHours) || 24

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString()
  }

  const handleResetForm = () => {
    setQuestion('')
    setCategory('technology')
    setIsAnonymous(false)
    setOptions([
      { id: '1', text: '' },
      { id: '2', text: '' },
    ])
    setExpiryOption('none')
    setPreviewSelectedOpt(null)
    setPreviewVotes({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    const cleanQuestion = question.trim()
    if (!cleanQuestion) {
      setError('Please provide a poll question')
      return
    }

    const cleanOptions = options.map((o) => o.text.trim()).filter((t) => t.length > 0)
    if (cleanOptions.length < 2) {
      setError('A minimum of 2 valid options is required to launch a poll')
      return
    }

    setLoading(true)
    try {
      const expiresAt = calculateExpiryTime()
      const payload = {
        question: cleanQuestion,
        category,
        options: cleanOptions,
        expires_at: expiresAt,
        is_anonymous: isAnonymous,
      }

      const res = await pollService.createPoll(payload)
      setCreatedPoll({
        id: res.id,
        question: cleanQuestion,
      })
      setIsSuccessModalOpen(true)
    } catch (err) {
      setError(err.customMessage || 'Failed to create poll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate simulated preview metrics
  const totalSimulatedVotes = Object.values(previewVotes).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Create Live Poll
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Configure real-time polls, auto-close timers, categories, and test live responses before publishing.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Poll Question (Top Priority) with Live Character Counter */}
            <Card className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Poll Question <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const aiSuggestions = [
                        {
                          q: 'Which cloud provider offers the best developer experience for Kubernetes deployments?',
                          cat: 'technology',
                          opts: ['AWS (EKS)', 'Google Cloud (GKE)', 'Microsoft Azure (AKS)', 'DigitalOcean / Linode'],
                        },
                        {
                          q: 'What is the most critical factor when preparing for tech software engineering placements?',
                          cat: 'education',
                          opts: ['Data Structures & Algorithms', 'Full-Stack Production Projects', 'System Design & Architecture', 'Mock Interviews & Soft Skills'],
                        },
                        {
                          q: 'Which emerging AI technology will have the greatest impact on software engineering by 2027?',
                          cat: 'technology',
                          opts: ['Autonomous AI Coding Agents', 'Specialized SLMs & On-Device Models', 'Vector Search & Knowledge Graphs', 'Multimodal Foundation Models'],
                        },
                        {
                          q: 'What is your primary choice of database for event-driven real-time analytics?',
                          cat: 'technology',
                          opts: ['MongoDB + Change Streams', 'PostgreSQL + TimescaleDB', 'ClickHouse OLAP', 'Redis Enterprise'],
                        },
                        {
                          q: 'Which format of technical interview best measures an engineer’s true potential?',
                          cat: 'education',
                          opts: ['Take-home project review', 'Live pair-programming', 'System design whiteboard', 'LeetCode DSA problems'],
                        },
                        {
                          q: 'Which project domain should our upcoming 24-hour hackathon focus on?',
                          cat: 'general',
                          opts: ['Generative AI & LLMs', 'Full-Stack Web3 & Fintech', 'Cloud Infrastructure & DevOps', 'HealthTech & Biotech'],
                        },
                      ]
                      const pick = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]
                      setQuestion(pick.q)
                      setCategory(pick.cat)
                      setOptions(pick.opts.map((opt, i) => ({ id: (i + 1).toString(), text: opt })))
                      setPreviewSelectedOpt(null)
                      setPreviewVotes({})
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-bold transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>AI Suggest Idea</span>
                  </button>

                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                      question.length > 130
                        ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    ({question.length}/150)
                  </span>
                </div>
              </div>

              <textarea
                value={question}
                maxLength={150}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is your preferred frontend framework in 2026?"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition resize-none font-medium shadow-sm"
              />
            </Card>

            {/* 2. Category Selection */}
            <Card className="p-6 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" /> Select Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition ${
                      category === c.id
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* 3. Quick Templates */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> One-Click Templates
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Pre-filled choices</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                  >
                    <span className="text-indigo-500 font-bold">#</span>
                    <span>{tpl.title}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* 4. Expiration Scheduler & Anonymous Voting */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-500" /> Auto-Close Schedule
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Go Cron Job background worker</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'none', label: 'No Limit' },
                  { id: '1h', label: '1 Hour' },
                  { id: '24h', label: '24 Hours' },
                  { id: '3d', label: '3 Days' },
                  { id: '7d', label: '7 Days' },
                  { id: 'custom', label: 'Custom' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExpiryOption(item.id)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold transition text-center ${
                      expiryOption === item.id
                        ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {expiryOption === 'custom' && (
                <div className="pt-2 flex items-center gap-3">
                  <Input
                    label="Custom Expiration (Hours)"
                    type="number"
                    min="1"
                    max="720"
                    value={customExpiryHours}
                    onChange={(e) => setCustomExpiryHours(e.target.value)}
                    placeholder="24"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 self-end pb-3">hours from now</span>
                </div>
              )}

              {/* Anonymous voting toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="anonToggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Enable Anonymous Voting
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Keep voter identities completely confidential</p>
                </div>
                <input
                  id="anonToggle"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </Card>

            {/* 5. Poll Options (Min 2, Max 8) */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" /> Poll Options
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {options.length}/8 options (Min 2 required)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    disabled={options.length >= 8}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Choice
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {options.map((opt, index) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      disabled={options.length <= 2}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title={options.length <= 2 ? 'Minimum 2 options required' : 'Remove choice'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                isLoading={loading}
              >
                <Sparkles className="w-4 h-4" />
                Publish Live Poll
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Synchronized Preview Panel (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Live Interactive Preview
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Synchronized
            </span>
          </div>

          <Card className="p-6 space-y-5 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-slate-200 dark:border-indigo-500/20 shadow-xl">
            {/* Preview Badges */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] capitalize border border-slate-200 dark:border-slate-700">
                {categories.find((c) => c.id === category)?.icon} {category}
              </span>

              <div className="flex items-center gap-1.5">
                {isAnonymous && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/20">
                    Anonymous
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-500/20">
                  active
                </span>
              </div>
            </div>

            {/* Preview Question */}
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {question.trim() || 'Your question will appear here in real time...'}
            </h4>

            {/* Interactive Options Simulation */}
            <div className="space-y-2.5 pt-1">
              {options.map((opt, i) => {
                const optText = opt.text.trim() || `Option ${i + 1}`
                const optVotes = previewVotes[opt.id] || 0
                const percent = totalSimulatedVotes > 0 ? Math.round((optVotes / totalSimulatedVotes) * 100) : 0
                const isSelected = previewSelectedOpt === opt.id

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePreviewVote(opt.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Simulated Percentage Bar */}
                    {totalSimulatedVotes > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-indigo-500/10 dark:bg-indigo-600/20 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{optText}</span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {totalSimulatedVotes > 0 && (
                          <span className="font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">{percent}%</span>
                        )}
                        <CheckCircle2
                          className={`w-4 h-4 transition ${
                            isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-500'
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Preview Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {totalSimulatedVotes} {totalSimulatedVotes === 1 ? 'vote' : 'votes'} (Simulated)
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">Click choices to simulate voting</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {createdPoll && (
        <CreatePollSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          pollId={createdPoll.id}
          question={createdPoll.question}
          onReset={handleResetForm}
        />
      )}
    </div>
  )
}

export default CreatePoll
