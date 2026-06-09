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
  { name: 'AI Insights', href: '/insights', icon: Brain },
  { name: 'Monthly Report', href: '/report', icon: FileText }, // ✅ ADD
  { name: 'Bills', href: '/bills', icon: FileText }
]

function SidebarContent({ location, closeSidebar }) {
  return (
    <div className="flex flex-col h-full bg-surface-container border-r border-outline-variant transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 mt-5 mb-4">
        <Link to="/dashboard" className="flex items-center group" onClick={closeSidebar}>
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
            <img src="/logo.png" alt="PaisaPal Logo" className="h-full w-full object-cover" />
          </div>
          <span className="ml-3 text-xl font-extrabold text-on-surface tracking-tight">
            PaisaPal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        <nav className="px-3 space-y-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={clsx(
                  'group flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:scale-95'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 flex-shrink-0 h-5 w-5 transition-transform duration-200',
                    isActive
                      ? 'text-on-secondary'
                      : 'text-outline group-hover:text-secondary group-hover:scale-110'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const sidebarOpen = useSelector(selectSidebarOpen)

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false))
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 h-full">
          <SidebarContent location={location} closeSidebar={closeSidebar} />
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
            'fixed inset-0 bg-surface-dim/80 backdrop-blur-sm transition-opacity duration-300',
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />

        {/* Sidebar Panel */}
        <div
          className={clsx(
            'relative flex-1 flex flex-col max-w-xs w-full bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Close Button */}
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-surface-container-highest hover:bg-outline-variant focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-on-surface" />
            </button>
          </div>

          <SidebarContent location={location} closeSidebar={closeSidebar} />
        </div>
      </div>
    </>
  )
}
