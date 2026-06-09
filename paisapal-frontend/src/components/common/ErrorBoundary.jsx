import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
          <div className="max-w-md w-full bg-surface-container backdrop-blur-md rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-on-surface mb-4">
              Something went wrong
            </h1>
            
            <p className="text-on-surface-variant mb-8">
              We encountered an unexpected error. Please try refreshing the page or return to the dashboard.
            </p>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={this.handleRefresh}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </button>
              
              <Link to="/dashboard" className="btn-secondary">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm font-medium text-on-surface-variant cursor-pointer">
                  Error Details (Development)
                </summary>
                <div className="mt-4 p-4 bg-surface-container-highest rounded-md text-sm">
                  <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                  </pre>
                  <pre className="mt-4 whitespace-pre-wrap text-on-surface text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
