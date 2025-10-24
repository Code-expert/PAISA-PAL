import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, Bell, Search, User, X } from 'lucide-react'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { selectCurrentUser, logout } from '../../store/slices/authSlice'
import { useLogoutMutation } from '../../services/authApi'
import { useGetNotificationsQuery } from '../../services/notificationApi'
import ThemeToggle from '../ui/ThemeToggle'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

export default function Navigation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [searchOpen, setSearchOpen] = useState(false)

  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const { data: notifications } = useGetNotificationsQuery()

  const unreadCount = notifications?.data?.filter(n => !n.isRead).length || 0

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar())
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      toast.success('Logged out successfully')
      navigate('/auth/login')
    } catch (error) {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              onClick={handleSidebarToggle}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop Search Bar */}
            <div className="hidden md:block ml-4 flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Search transactions, budgets..."
                />
              </div>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden ml-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 sm:space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="User menu"
              >
                {user?.avatar || user?.photo ? (
                  <img
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm"
                    src={user.avatar || user.photo}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="hidden sm:block text-gray-700 dark:text-gray-200 font-semibold max-w-[120px] truncate">
                  {typeof user?.name === 'string'
                    ? user.name
                    : `${user?.name?.givenName || ''} ${user?.name?.familyName || ''}`.trim() || 'User'
                  }
                </span>
              </button>

              {/* Enhanced Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {typeof user?.name === 'string'
                      ? user.name
                      : `${user?.name?.givenName || ''} ${user?.name?.familyName || ''}`.trim() || 'User'
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-3 text-gray-400" />
                      Your Profile
                    </span>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-b-xl"
                  >
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (slides down) */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top duration-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all duration-200"
              placeholder="Search transactions, budgets..."
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
