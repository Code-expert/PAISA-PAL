import React, { useState } from 'react'
import { Bell, Check, Settings as SettingsIcon, Filter, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation
} from '../services/notificationApi'
import { toast } from 'react-hot-toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
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

      {/* Quick Actions Card */}
      {/* <Card>
        <Card.Content className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your notification settings and preferences
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Go to Settings
              </span>
              <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </Card.Content>
      </Card> */}

      {/* Notification Center Component */}
      <NotificationCenter />
    </div>
  )
}
