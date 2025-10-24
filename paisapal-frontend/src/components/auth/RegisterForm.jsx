import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRegisterMutation } from '../../services/authApi'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import GoogleLoginButton from './GoogleLoginButton'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain uppercase, lowercase, and number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Password strength calculator
const calculatePasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  return strength
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [register, { isLoading }] = useRegisterMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  const password = watch('password', '')
  
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  const getStrengthColor = (strength) => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  const getStrengthText = (strength) => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data
      const result = await register(registerData).unwrap()
      
      dispatch(setCredentials({ user: result.user, token: result.token }))
      
      if (result.requiresEmailVerification) {
        toast.success('Account created! Please verify your email.')
        navigate('/auth/verify-email', { 
          state: { email: data.email } 
        })
      } else {
        toast.success('Account created successfully!')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center space-x-2 group mb-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <span className="text-white font-bold text-xl sm:text-2xl">₹</span>
            </div>
          </Link>
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create Your Account
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Start your journey with{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">PaisaPal</span>
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
            >
              Sign in instead
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 lg:p-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...formRegister('name')}
                  type="text"
                  className={`w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-300 dark:border-red-500' 
                      : touchedFields.name && !errors.name
                      ? 'border-emerald-300 dark:border-emerald-500'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                {touchedFields.name && !errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start">
                  <span className="inline-block mr-1">⚠</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...formRegister('email')}
                  type="email"
                  className={`w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-500' 
                      : touchedFields.email && !errors.email
                      ? 'border-emerald-300 dark:border-emerald-500'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                {touchedFields.email && !errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start">
                  <span className="inline-block mr-1">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Strength Indicator */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...formRegister('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-11 pr-12 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-500' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Password strength:
                    </span>
                    <span className={`text-xs font-bold ${
                      passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' :
                      passwordStrength <= 4 ? 'text-blue-600' :
                      'text-emerald-600'
                    }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? getStrengthColor(passwordStrength)
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span className={`mr-2 ${password.length >= 8 ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {password.length >= 8 ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span className={`mr-2 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'}
                  </span>
                  Uppercase & lowercase letters
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span className={`mr-2 ${/\d/.test(password) ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {/\d/.test(password) ? '✓' : '○'}
                  </span>
                  At least one number
                </p>
              </div>
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start">
                  <span className="inline-block mr-1">⚠</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...formRegister('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-11 pr-12 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-300 dark:border-red-500' 
                      : touchedFields.confirmPassword && !errors.confirmPassword
                      ? 'border-emerald-300 dark:border-emerald-500'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  )}
                </button>
                {touchedFields.confirmPassword && !errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-12 pr-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start">
                  <span className="inline-block mr-1">⚠</span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Register */}
            <GoogleLoginButton isSignUp />
          </form>
        </div>

        {/* Terms & Privacy */}
        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors duration-200">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors duration-200">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
