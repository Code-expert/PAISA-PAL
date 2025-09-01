import { createListenerMiddleware } from '@reduxjs/toolkit'
import { logout } from '../slices/authSlice'

// Create auth middleware to handle token expiration and unauthorized responses
export const authMiddleware = createListenerMiddleware()

// Listen for 401 responses and automatically logout
authMiddleware.startListening({
  matcher: (action) => {
    return action.type.endsWith('/rejected') && 
           action.payload?.status === 401
  },
  effect: async (action, listenerApi) => {
    // Auto logout on 401 responses
    listenerApi.dispatch(logout())
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  },
})

// Listen for network errors
authMiddleware.startListening({
  matcher: (action) => {
    return action.type.endsWith('/rejected') && 
           action.error?.name === 'NetworkError'
  },
  effect: async (action, listenerApi) => {
    // Handle network errors - could show toast notification
    console.error('Network error:', action.error)
  },
})
