import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowRight, RefreshCw, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
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
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation()

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verificationSchema),
  })

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
    const code = otp.join('')
    if (code.length === 6) {
      setValue('code', code)
      handleSubmit(onSubmit)()
    }
  }, [otp])

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      while (newOtp.length < 6) newOtp.push('')
      setOtp(newOtp)
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  const onSubmit = async () => {
    if (!email) {
      toast.error('Email is required for verification')
      navigate('/auth/login')
      return
    }

    const code = otp.join('')
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    try {
      await verifyEmail({ email, code }).unwrap()
      dispatch(setEmailVerified())
      toast.success('Email verified successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.data?.message || 'Invalid verification code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is required for verification')
      return
    }

    try {
      await resendVerification({ email }).unwrap()
      toast.success('Verification code sent to your email!')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to resend code. Please try again.')
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  if (user?.googleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 max-w-md">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Account Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your Google account is already verified. Redirecting to dashboard...
          </p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </Link>
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            Verify Your Email
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {email || 'your email'}
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 lg:p-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Display/Input (only if email not provided) */}
            {!location.state?.email && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {/* OTP Input Boxes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex gap-2 sm:gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 dark:bg-gray-700 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.code
                        ? 'border-red-300 dark:border-red-500'
                        : digit
                        ? 'border-emerald-300 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    } text-gray-900 dark:text-white`}
                    autoComplete="off"
                  />
                ))}
              </div>
              {errors.code && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center">
                  <span className="inline-block mr-1">⚠</span>
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || !email || otp.join('').length < 6}
              className="w-full flex items-center justify-center px-6 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Resend code
                    </>
                  )}
                </button>
              )}
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 inline-flex items-center"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 text-center">
            <strong>💡 Tip:</strong> Check your spam folder if you don't see the email.{' '}
            Need help?{' '}
            <Link 
              to="/support" 
              className="font-semibold underline hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
