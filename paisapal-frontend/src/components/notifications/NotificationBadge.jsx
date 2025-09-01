import React from 'react'
import { Bell } from 'lucide-react'
import { useGetNotificationsQuery } from '../../services/notificationApi'
import Badge from '../ui/Badge'

export default function NotificationBadge({ className = '' }) {
  const { data } = useGetNotificationsQuery()
  const notifications = data?.notifications || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      {unreadCount > 0 && (
        <Badge
          variant="error"
          size="sm"
          className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  )
}
