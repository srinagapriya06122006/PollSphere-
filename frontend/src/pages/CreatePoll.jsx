import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Trash2, Plus, AlertCircle } from 'lucide-react'
import pollService from '../services/pollService'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

export const CreatePoll = () => {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleOptionChange = (index, value) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const filteredOptions = options.map((opt) => opt.trim()).filter((opt) => opt !== '')
    if (filteredOptions.length < 2) {
      setError('Please provide at least 2 non-empty options')
      setLoading(false)
      return
    }

    try {
      const createdPoll = await pollService.createPoll({
        question: question.trim(),
        options: filteredOptions,
      })
      if (createdPoll?.id) {
        navigate(`/polls/${createdPoll.id}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card className="p-8">
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <PlusCircle className="w-3.5 h-3.5" />
            New Live Poll
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create a New Poll</h1>
          <p className="text-xs text-slate-400">Ask a question and define choices for voters in real time</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Poll Question"
            id="question"
            required
            placeholder="e.g. Which programming language do you prefer for high concurrency?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Poll Options (Min 2, Max 8)
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 8 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Another Option
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="md" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              Publish Poll
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreatePoll
