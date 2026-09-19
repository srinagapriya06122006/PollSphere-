import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '327056061231-vm0fhi95eupnpd059d0s3ebfm1lv40kj.apps.googleusercontent.com'

export default function GoogleSignInButton({ onError, buttonText = 'Continue with Google' }) {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const googleBtnContainerRef = useRef(null)

  // Determine redirect URL from query param or router state or default to dashboard
  const searchParams = new URLSearchParams(location.search)
  const redirectUrl = searchParams.get('redirect') || location.state?.from?.pathname || '/dashboard'

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      const err = 'Failed to receive Google credential'
      setErrorMsg(err)
      if (onError) onError(err)
      return
    }

    if (loading) return // Prevent duplicate calls

    setLoading(true)
    setErrorMsg('')

    try {
      await loginWithGoogle(response.credential)
      navigate(redirectUrl, { replace: true })
    } catch (err) {
      console.error('Google sign-in error:', err)
      const message =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'Google authentication failed. Please try again.'
      setErrorMsg(message)
      if (onError) onError(message)
      setLoading(false)
    }
  }

  useEffect(() => {
    let checkGsiInterval = null

    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          // Render Google's native button inside the container
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: googleBtnContainerRef.current.offsetWidth || 340,
          })
        } catch (e) {
          console.warn('Google Identity Services initialization error:', e)
        }
      }
    }

    if (window.google?.accounts?.id) {
      initializeGsi()
    } else {
      // Retry in case SDK script tag is loading asynchronously
      let retries = 0
      checkGsiInterval = setInterval(() => {
        retries += 1
        if (window.google?.accounts?.id) {
          initializeGsi()
          clearInterval(checkGsiInterval)
        } else if (retries > 20) {
          clearInterval(checkGsiInterval)
        }
      }, 200)
    }

    return () => {
      if (checkGsiInterval) clearInterval(checkGsiInterval)
    }
  }, [])

  const handleCustomButtonClick = () => {
    if (loading) return
    setErrorMsg('')

    if (window.google?.accounts?.id) {
      // Prompt GIS one-tap / sign-in dialog
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          // If prompt cannot be displayed, user can click the rendered GIS button directly
          console.info('GIS prompt not displayed:', notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.info('GIS prompt skipped:', notification.getSkippedReason())
        }
      })
    } else {
      setErrorMsg('Google Sign-In SDK is loading. Please check your internet connection.')
    }
  }

  return (
    <div className="w-full space-y-3">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-800/90 border border-indigo-500/40 text-slate-200 text-sm font-semibold shadow-inner animate-pulse">
          <svg
            className="animate-spin h-4 w-4 text-indigo-400 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Loading... Verifying Google account</span>
        </div>
      ) : (
        <div
          ref={googleBtnContainerRef}
          className="w-full flex justify-center min-h-[44px]"
          style={{ colorScheme: 'dark' }}
        />
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
