import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserPlus, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { validateEmail } from '../utils/validators'

export const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, login } = useAuth()

  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  // Retrieve destination path if user was redirected here
  const searchParams = new URLSearchParams(location.search)
  const redirectQuery = searchParams.get('redirect')
  const fromPath = redirectQuery || location.state?.from?.pathname || '/'

  // Handle email changes and live validation if touched
  const handleEmailChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, email: value }))

    if (emailTouched || emailError) {
      const { isValid, error } = validateEmail(value)
      setEmailError(isValid ? '' : error)
    }
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
    const { isValid, error } = validateEmail(formData.email)
    setEmailError(isValid ? '' : error)
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, password: value }))
    if (value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters')
    } else {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    // Validate Full Name
    if (!formData.name.trim()) {
      setNameError('Full name is required')
      return
    }
    setNameError('')

    // Validate Email
    setEmailTouched(true)
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error)
      return
    }
    setEmailError('')

    // Validate Password
    if (!formData.password || formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setPasswordError('')

    setLoading(true)

    const normalizedEmail = formData.email.trim().toLowerCase()
    const trimmedName = formData.name.trim()

    try {
      await register(trimmedName, normalizedEmail, formData.password)
      // Auto login upon successful registration
      await login(normalizedEmail, formData.password)
      navigate(fromPath, { replace: true })
    } catch (err) {
      setServerError(err.customMessage || err.response?.data?.message || 'Failed to register account')
    } finally {
      setLoading(false)
    }
  }

  const isEmailValid = emailTouched && !emailError && formData.email.trim().length > 0

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

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            id="name"
            required
            placeholder="Sri"
            value={formData.name}
            error={nameError}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (nameError) setNameError('')
            }}
          />

          <Input
            label="Email Address"
            type="email"
            id="email"
            required
            placeholder="sri@example.com"
            value={formData.email}
            error={emailError}
            isValid={isEmailValid}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            helperText={!emailError && isEmailValid ? 'Valid email format' : undefined}
          />

          <Input
            label="Password"
            type="password"
            id="password"
            required
            error={passwordError}
            helperText={!passwordError ? 'Minimum 6 characters' : undefined}
            placeholder="••••••••"
            value={formData.password}
            onChange={handlePasswordChange}
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2 font-bold" isLoading={loading}>
            Sign Up & Get Started
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to={redirectQuery ? `/login?redirect=${encodeURIComponent(redirectQuery)}` : '/login'}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Register
