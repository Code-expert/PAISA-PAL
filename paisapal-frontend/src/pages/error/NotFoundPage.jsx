import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            as={Link}
            to="/dashboard"
            variant="primary"
            leftIcon={<Home className="w-4 h-4" />}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
