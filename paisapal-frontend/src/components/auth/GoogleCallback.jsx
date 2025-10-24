import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/slices/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        const userParam = searchParams.get('user')
        const error = searchParams.get('error')

        // Handle errors from backend
        if (error) {
          const errorMessages = {
            auth_failed: 'Google authentication failed. Please try again.',
            no_user: 'Unable to authenticate with Google. Please try again.',
            server_error: 'Server error occurred during authentication.',
          }
          
          const message = errorMessages[error] || 'Authentication failed'
          setError(message)
          toast.error(message)
          
          setTimeout(() => navigate('/auth/login'), 3000)
          return
        }

        // Handle successful authentication
        if (token && userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam))
            
            // Validate user data
            if (!user.email || !user.name) {
              throw new Error('Invalid user data received')
            }
            
            dispatch(setCredentials({ user, token }))
            toast.success(`Welcome back, ${user.name}!`)
            navigate('/dashboard')
          } catch (parseError) {
            console.error('Error parsing user data:', parseError)
            setError('Invalid authentication data received')
            toast.error('Authentication data is corrupted')
            setTimeout(() => navigate('/auth/login'), 3000)
          }
        } else {
          // Missing required parameters
          setError('Missing authentication data')
          toast.error('Authentication failed - missing data')
          setTimeout(() => navigate('/auth/login'), 3000)
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error)
        setError('An unexpected error occurred')
        toast.error('Authentication failed')
        setTimeout(() => navigate('/auth/login'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, dispatch])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Completing Google authentication...
        </p>
      </div>
    </div>
  )
}
