import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { validateEmail } from '../utils/validators'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  // Retrieve destination path if user was redirected here from a protected page
  const searchParams = new URLSearchParams(location.search)
  const redirectQuery = searchParams.get('redirect')
  const fromPath = redirectQuery || location.state?.from?.pathname || '/'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    // Validate email
    setEmailTouched(true)
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error)
      return
    }
    setEmailError('')

    // Validate password
    if (!formData.password) {
      setPasswordError('Password is required')
      return
    }
    setPasswordError('')

    setLoading(true)

    const normalizedEmail = formData.email.trim().toLowerCase()

    try {
      await login(normalizedEmail, formData.password)
      navigate(fromPath, { replace: true })
    } catch (err) {
      if (err.customMessage === 'Network Error' || err.message === 'Network Error') {
        setServerError('Unable to connect to backend server (http://localhost:8080). Please check your connection or backend status.')
      } else {
        setServerError(err.customMessage || err.response?.data?.message || 'Invalid email or password. If you do not have an account yet, please sign up.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isRedirected = Boolean(redirectQuery || location.state?.from)
  const isEmailValid = emailTouched && !emailError && formData.email.trim().length > 0

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-8">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your account to create and manage live polls</p>
        </div>

        {isRedirected && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-medium">
            Please sign in to access that page
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            id="email"
            required
            placeholder="you@example.com"
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
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              if (passwordError) setPasswordError('')
            }}
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2 font-bold" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link
            to={redirectQuery ? `/register?redirect=${encodeURIComponent(redirectQuery)}` : '/register'}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Login
