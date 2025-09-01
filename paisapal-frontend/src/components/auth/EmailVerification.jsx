import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import { useVerifyEmailMutation, useResendVerificationMutation } from '../../services/authApi'
import { useDispatch } from 'react-redux'
import { setEmailVerified } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
})

export default function EmailVerification() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)

  const [email, setEmail] = useState(location.state?.email || '')
  const [resendCooldown, setResendCooldown] = useState(0)

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(verificationSchema),
  })

  const code = watch('code')
   useEffect(() => {
    if (user?.googleId || user?.isEmailVerified) {
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-submit when code is complete
  useEffect(() => {
    if (code && code.length === 6) {
      handleSubmit(onSubmit)()
    }
  }, [code])

  const onSubmit = async (data) => {
    if (!email) {
      toast.error('Email is required for verification')
      navigate('/auth/login')
      return
    }

    try {
      await verifyEmail({ 
        email, 
        code: data.code 
      }).unwrap()
      
      dispatch(setEmailVerified())
      toast.success('Email verified successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.data?.message || 'Verification failed')
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is required for verification')
      return
    }

    try {
      await resendVerification({ email }).unwrap()
      toast.success('Verification code sent!')
      setResendCooldown(60) // 60 second cooldown
    } catch (error) {
      toast.error(error.data?.message || 'Failed to resend code')
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }
if (user?.googleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Account Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your Google account is already verified. Redirecting to dashboard...
          </p>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit code to your email address
          </p>
        </div>

        <div className="card p-8">
          {/* Email Display/Input */}
          <div className="mb-6">
            <label className="form-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
              placeholder="Enter your email"
              disabled={!!location.state?.email}
            />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Verification Code Input */}
            <div>
              <label className="form-label">Verification code</label>
              <input
                {...register('code')}
                type="text"
                maxLength="6"
                className="form-input text-center text-2xl tracking-widest"
                placeholder="000000"
                autoComplete="one-time-code"
              />
              {errors.code && (
                <p className="form-error">{errors.code.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isVerifying || !email}
                className="btn-primary w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-500">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend code'
                  )}
                </button>
              )}
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Having trouble? Check your spam folder or{' '}
            <Link to="/support" className="text-primary-600 hover:text-primary-500">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
