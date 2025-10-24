import React from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectSidebarOpen, setSidebarOpen } from '../../store/slices/uiSlice'
import Navigation from './Navigation'
import Sidebar from './Sidebar'

export default function Layout() {
  const sidebarOpen = useSelector(selectSidebarOpen)
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-50 to-emerald-50/30 dark:from-gray-950 dark:via-slate-950 dark:to-gray-950 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => dispatch(setSidebarOpen(false))}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <Navigation />
        
        {/* Page Content with Scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Content appears here via React Router Outlet */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
              </div>
            </div>
          </div>
        </main>

        {/* Optional Footer */}
        <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              © 2025 PaisaPal. Made with <span className="text-emerald-600 dark:text-emerald-400">💚</span> for better financial management.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
