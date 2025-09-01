import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice'

export default function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  const needsEmailVerification = !user?.isEmailVerified && !user?.googleId
  
  if (needsEmailVerification) {
    return <Navigate to="/auth/verify-email" replace />
  }

  return <Outlet />
}
