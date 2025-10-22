import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Home,
  CreditCard,
  PieChart,
  TrendingUp,
  Receipt,
  BarChart3,
  Brain,
  X
} from 'lucide-react'
import { 
  selectSidebarOpen, 
  setSidebarOpen 
} from '../../store/slices/uiSlice'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
  { name: 'Receipts', href: '/receipts', icon: Receipt },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Insights', href: '/insights', icon: Brain },
  { name: 'Bills', href: '/bills', icon: CreditCard }
]

export default function Sidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const sidebarOpen = useSelector(selectSidebarOpen)

  const closeSidebar = () => {
    dispatch(setSidebarOpen(false))
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/dashboard" className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₹</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  PaisaPal
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={clsx(
          'fixed inset-0 flex z-40 lg:hidden',
          sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          className={clsx(
            'fixed inset-0 bg-gray-600 transition-opacity',
            sidebarOpen ? 'bg-opacity-75' : 'bg-opacity-0'
          )}
          onClick={closeSidebar}
        />

        <div
          className={clsx(
            'relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transform transition-transform',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={closeSidebar}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Mobile Logo */}
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/dashboard" className="flex items-center" onClick={closeSidebar}>
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₹</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  PaisaPal
                </span>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <nav className="mt-8 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeSidebar}
                    className={clsx(
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-4 flex-shrink-0 h-6 w-6',
                        isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
