import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserPlus, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import { validateEmail, GMAIL_REGEX } from '../utils/validators'

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

  // Handle email changes with real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, email: value }))

    if (emailTouched || value.length > 0) {
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

  const isEmailValid = GMAIL_REGEX.test(formData.email.trim())
  const isFormValid = isEmailValid && formData.name.trim().length >= 2 && formData.password.length >= 6

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    // Validate Full Name
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setNameError('Full name must be at least 2 characters')
      return
    }
    setNameError('')

    // Validate Gmail Address
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
      if (err.customMessage === 'Network Error' || err.message === 'Network Error') {
        setServerError('Unable to connect to backend server (http://localhost:8080). Please ensure backend is running.')
      } else {
        setServerError(err.customMessage || err.response?.data?.error || err.response?.data?.message || 'Failed to register account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 px-2 sm:px-0">
      <Card className="p-6 sm:p-8">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create an Account</h1>
          <p className="text-xs text-slate-400">Join the live polling community with your Gmail address</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="mb-6">
          <GoogleSignInButton buttonText="Sign up with Google" />
          
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/95 px-3 text-slate-400 font-medium tracking-wider">
                Or continue with Gmail
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            id="name"
            required
            placeholder="Sri Nagapriya"
            value={formData.name}
            error={nameError}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (nameError) setNameError('')
            }}
          />

          <Input
            label="Gmail Address"
            type="email"
            id="email"
            required
            placeholder="username@gmail.com"
            value={formData.email}
            error={emailError}
            isValid={isEmailValid}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            helperText={
              isEmailValid
                ? 'Valid Gmail address'
                : emailTouched && !emailError
                ? undefined
                : 'Accepts username@gmail.com'
            }
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2 font-bold"
            disabled={!isFormValid || loading}
            isLoading={loading}
          >
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
