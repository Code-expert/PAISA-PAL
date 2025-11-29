import React, { useState } from 'react'
import { Bell, Check, Settings as SettingsIcon, Filter, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation
} from '../services/notificationApi'
import { toast } from 'react-hot-toast'
import Button from '../components/ui/Button'

import NotificationCenter from '../components/notifications/NotificationCenter'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useGetNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()

  const notifications = data?.data || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead)
    
    if (unreadNotifications.length === 0) {
      toast.success('No unread notifications')
      return
    }

    try {
      await Promise.all(
        unreadNotifications.map(notification => 
          markAsRead(notification._id).unwrap()
        )
      )
      toast.success('All notifications marked as read')
      refetch()
    } catch (error) {
      toast.error('Failed to mark notifications as read')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up! 🎉'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              leftIcon={<Check className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          )}
          
          {/* ✅ Navigate to Settings instead of modal */}
          <Button
            variant="secondary"
            leftIcon={<SettingsIcon className="w-4 h-4" />}
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
        </div>
      </div>



      {/* Notification Center Component */}
      <NotificationCenter />
    </div>
  )
}
