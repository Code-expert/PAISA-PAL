import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { useNotificationSetup } from '../../hooks/useNotificationSetup'

export default function NotificationButton() {
  const [permission, setPermission] = useState(Notification.permission)
  const [isLoading, setIsLoading] = useState(false)
  const { requestNotificationPermission } = useNotificationSetup()

  useEffect(() => {
    // Check permission status on mount
    setPermission(Notification.permission)
  }, [])

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    const result = await requestNotificationPermission()
    if (result?.success) {
      setPermission('granted')
    }
    setIsLoading(false)
  }

  // If already granted
  if (permission === 'granted') {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-700 dark:text-green-300">
          Notifications Enabled
        </span>
      </div>
    )
  }

  // If blocked
  if (permission === 'denied') {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <BellOff className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-700 dark:text-red-300">
          Notifications Blocked
        </span>
      </div>
    )
  }

  // If not asked yet
  return (
    <button
      onClick={handleEnableNotifications}
      disabled={isLoading}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all"
    >
      <Bell className="w-4 h-4" />
      <span>{isLoading ? 'Enabling...' : 'Enable Notifications'}</span>
    </button>
  )
}
