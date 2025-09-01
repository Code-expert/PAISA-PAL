import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, Bell, Search, Sun, Moon, User } from 'lucide-react'
import {
  toggleSidebar,
  toggleDarkMode,
  selectDarkMode
} from '../../store/slices/uiSlice'
import {
  selectCurrentUser,
  logout
} from '../../store/slices/authSlice'
import { useLogoutMutation } from '../../services/authApi'
import { useGetNotificationsQuery } from '../../services/notificationApi'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Navigation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const darkMode = useSelector(selectDarkMode)
  const user = useSelector(selectCurrentUser)

  const [logoutMutation] = useLogoutMutation()
  const { data: notifications } = useGetNotificationsQuery()

  const unreadCount = notifications?.data?.filter(n => !n.isRead).length || 0

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar())
  }

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode())
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      toast.success('Logged out successfully')
      navigate('/auth/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={handleSidebarToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search transactions, budgets..."
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={handleDarkModeToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <Link
                to="/notifications"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                {user?.avatar || user?.photo ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.avatar || user.photo}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                )}
                <span className="hidden md:block text-gray-700 dark:text-gray-300">
                  {typeof user?.name === 'string'
                    ? user.name
                    : `${user?.name?.givenName || ''} ${user?.name?.familyName || ''}`.trim()
                  }
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
