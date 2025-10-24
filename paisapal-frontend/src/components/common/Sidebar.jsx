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
  X,
  FileText
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
  { name: 'Bills', href: '/bills', icon: FileText }
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
          <div className="flex flex-col flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-800 shadow-lg transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-2">
              <Link to="/dashboard" className="flex items-center group">
                <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-white font-bold text-xl">₹</span>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  PaisaPal
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex-1 px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 transform',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 flex-shrink-0 h-5 w-5 transition-transform duration-200',
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:scale-110'
                      )}
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                  💡 Pro Tip
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Check AI Insights for personalized money-saving tips!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={clsx(
          'fixed inset-0 flex z-40 lg:hidden transition-all duration-300',
          sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className={clsx(
            'fixed inset-0 bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300',
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        {/* Sidebar Panel */}
        <div
          className={clsx(
            'relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Close Button */}
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              onClick={closeSidebar}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-gray-900/50 hover:bg-gray-900/75 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Mobile Logo */}
            <div className="flex-shrink-0 flex items-center px-4 mb-6">
              <Link to="/dashboard" className="flex items-center group" onClick={closeSidebar}>
                <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-xl">₹</span>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  PaisaPal
                </span>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <nav className="px-3 space-y-1">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeSidebar}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={clsx(
                      'group flex items-center px-3 py-3 text-base font-semibold rounded-xl transition-all duration-200 animate-in slide-in-from-left',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-4 flex-shrink-0 h-6 w-6 transition-transform duration-200',
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      )}
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Footer Tip */}
            <div className="px-3 mt-6">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                  💡 Pro Tip
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Check AI Insights for personalized money-saving tips!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
