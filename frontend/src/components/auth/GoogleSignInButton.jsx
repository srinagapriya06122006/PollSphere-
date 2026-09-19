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
  const [gisRendered, setGisRendered] = useState(false)
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
    let renderTimeout = null

    const renderGsiButton = () => {
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        // Compute safe width clamped strictly between 200px and 380px for mobile safety
        const measuredWidth = googleBtnContainerRef.current.offsetWidth || 300
        const safeWidth = Math.floor(Math.min(Math.max(measuredWidth, 200), 380))

        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: safeWidth,
        })

        setGisRendered(true)
      } catch (e) {
        console.warn('Google Identity Services renderButton error:', e)
      }
    }

    const tryInit = () => {
      if (window.google?.accounts?.id) {
        // Allow brief frame render so offsetWidth is reliably measured on mobile devices
        renderTimeout = setTimeout(renderGsiButton, 100)
      } else {
        let retries = 0
        checkGsiInterval = setInterval(() => {
          retries += 1
          if (window.google?.accounts?.id) {
            renderGsiButton()
            clearInterval(checkGsiInterval)
          } else if (retries > 25) {
            clearInterval(checkGsiInterval)
          }
        }, 150)
      }
    }

    tryInit()

    // Re-render on window resize to ensure proper mobile width
    const handleResize = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        renderGsiButton()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (checkGsiInterval) clearInterval(checkGsiInterval)
      if (renderTimeout) clearTimeout(renderTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleCustomButtonClick = () => {
    if (loading) return
    setErrorMsg('')

    if (window.google?.accounts?.id) {
      // 1. If native GIS button rendered inside container, trigger click
      const nativeBtn = googleBtnContainerRef.current?.querySelector('div[role=button], iframe')
      if (nativeBtn) {
        nativeBtn.click()
        return
      }

      // 2. Otherwise trigger prompt dialog
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.info('GIS prompt not displayed:', notification.getNotDisplayedReason())
        }
      })
    } else {
      setErrorMsg('Google Sign-In is initializing. Please check your internet connection and try again.')
    }
  }

  return (
    <div className="w-full space-y-3">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-slate-800/90 border border-indigo-500/40 text-slate-200 text-sm font-semibold shadow-inner animate-pulse">
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
        <div className="relative w-full flex justify-center items-center min-h-[44px]">
          {/* Official GIS Rendered Button Container */}
          <div
            ref={googleBtnContainerRef}
            className={`w-full flex justify-center transition-opacity duration-200 ${
              gisRendered ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            }`}
            style={{ colorScheme: 'dark' }}
          />

          {/* High-Contrast Mobile / Fallback Button (visible whenever GIS is loading or on restricted mobile browsers) */}
          {!gisRendered && (
            <button
              type="button"
              onClick={handleCustomButtonClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all border border-slate-300 shadow-sm active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{buttonText}</span>
            </button>
          )}
        </div>
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
