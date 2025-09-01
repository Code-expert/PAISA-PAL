import React from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectSidebarOpen } from '../../store/slices/uiSlice'
import Navigation from './Navigation'
import Sidebar from './Sidebar'

export default function Layout() {
  const sidebarOpen = useSelector(selectSidebarOpen)

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navigation />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
