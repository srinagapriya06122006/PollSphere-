import React, { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // Verify and sync current user on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const response = await apiClient.get('/auth/me')
          const userData = response.data?.data
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          // Token is invalid or expired
          console.warn('Session expired or invalid token', error)
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()

    const handleAuthChange = () => {
      const storedUser = localStorage.getItem('user')
      const storedTok = localStorage.getItem('token')
      setUser(storedUser ? JSON.parse(storedUser) : null)
      setToken(storedTok || null)
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => window.removeEventListener('auth-change', handleAuthChange)
  }, [])

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password })
    const { token: jwtToken, user: userData } = response.data?.data || {}

    if (jwtToken && userData) {
      localStorage.setItem('token', jwtToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(jwtToken)
      setUser(userData)
      window.dispatchEvent(new Event('auth-change'))
    }

    return userData
  }

  const register = async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { name, email, password })
    return response.data?.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
