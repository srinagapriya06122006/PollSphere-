import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

export const Register = () => {
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await register(formData.name, formData.email, formData.password)
      // Auto login upon successful registration
      await login(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.customMessage || 'Failed to register account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-8">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create an Account</h1>
          <p className="text-xs text-slate-400">Join the live polling community in seconds</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            id="name"
            required
            placeholder="Sri"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            id="email"
            required
            placeholder="sri@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            id="password"
            required
            helperText="Minimum 6 characters"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={loading}>
            Sign Up & Get Started
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Register
