import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { ArrowRight, Shield, BarChart3, Smartphone } from 'lucide-react'

export default function HomePage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">PaisaPal</span>
          </div>
          
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth/login" className="btn-secondary">
                  Sign In
                </Link>
                <Link to="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Take Control of Your{' '}
            <span className="text-primary-600">Finances</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            PaisaPal helps you track expenses, manage budgets, and make smarter financial decisions with AI-powered insights.
          </p>
          
          {!isAuthenticated && (
            <div className="space-x-4">
              <Link to="/auth/register" className="btn-primary btn-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/auth/login" className="btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Smart Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get detailed insights into your spending patterns and financial health.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your financial data is encrypted and secured with industry-standard protection.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Mobile First
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access your finances anywhere with our responsive web application.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
