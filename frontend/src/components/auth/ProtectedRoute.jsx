import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Prevent authentication flash/flicker while token is being verified
  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingSpinner message="Verifying authentication credentials..." />
      </div>
    )
  }

  // Strictly block unauthenticated visitors and redirect to login with return URL
  if (!isAuthenticated) {
    const redirectPath = location.pathname + location.search
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
