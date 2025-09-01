import React, { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, Settings, 
  AlertTriangle, DollarSign, Target, Calendar, TrendingUp
} from 'lucide-react'
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useDeleteNotificationMutation 
} from '../../services/notificationApi'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'

const NOTIFICATION_TYPES = {
  budget_alert: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900'
  },
  transaction: {
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900'
  },
  goal_achieved: {
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900'
  },
  bill_reminder: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900'
  },
  investment: {
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900'
  }
}

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.transaction
  const Icon = typeConfig.icon

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id)
    }
  }

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return format(date, 'MMM dd, yyyy')
  }

  return (
    <Card 
      className={`hover:shadow-md transition-all cursor-pointer ${
        !notification.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Notification Icon */}
          <div className={`flex-shrink-0 p-2 rounded-full ${typeConfig.bgColor}`}>
            <Icon className={`w-5 h-5 ${typeConfig.color}`} />
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                
                {/* Notification Meta */}
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                  
                  {notification.priority === 'high' && (
                    <Badge variant="error" size="sm">
                      High Priority
                    </Badge>
                  )}
                  
                  {notification.actionUrl && (
                    <Button size="sm" variant="secondary">
                      View Details
                    </Button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-2">
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowActions(!showActions)
                  }}
                  className="p-1"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Menu */}
            {showActions && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Check className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead(notification._id)
                        setShowActions(false)
                      }}
                    >
                      Mark as Read
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="danger"
                    leftIcon={<Trash2 className="w-3 h-3" />}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(notification._id)
                      setShowActions(false)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function NotificationCenter() {
  const [filter, setFilter] = useState('all') // all, unread, read
  const [showSettings, setShowSettings] = useState(false)

  const { data, isLoading, error, refetch } = useGetNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  const notifications = data?.notifications || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap()
      refetch()
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId).unwrap()
      toast.success('Notification deleted')
      refetch()
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n._id).unwrap())
      )
      toast.success('All notifications marked as read')
      refetch()
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Failed to load notifications. Please try again.</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          )}
          
          <Button
            variant="secondary"
            leftIcon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="p-4">
          <div className="flex items-center space-x-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(tab.key)}
                className="relative"
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge 
                    variant={filter === tab.key ? 'secondary' : 'primary'} 
                    size="sm" 
                    className="ml-2"
                  >
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={filter === 'unread' ? BellOff : Bell}
          title={
            filter === 'unread' ? 'No unread notifications' :
            filter === 'read' ? 'No read notifications' : 'No notifications'
          }
          description={
            filter === 'unread' ? 'All caught up! You have no unread notifications.' :
            filter === 'read' ? 'No read notifications to show.' :
            'Notifications about your financial activities will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}

// Notification Settings Component
function NotificationSettings({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    transactionNotifications: true,
    billReminders: true,
    goalAchievements: true,
    investmentUpdates: false,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false
  })

  const handleSave = () => {
    // TODO: Save notification preferences to backend
    toast.success('Notification preferences saved')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notification Types
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'budgetAlerts', label: 'Budget Alerts', description: 'When you approach or exceed budget limits' },
              { key: 'transactionNotifications', label: 'Transaction Updates', description: 'New transactions and balance changes' },
              { key: 'billReminders', label: 'Bill Reminders', description: 'Upcoming bill due dates' },
              { key: 'goalAchievements', label: 'Goal Achievements', description: 'When you reach savings or budget goals' },
              { key: 'investmentUpdates', label: 'Investment Updates', description: 'Portfolio performance and market changes' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Delivery Methods
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'pushNotifications', label: 'Push Notifications', description: 'In-app notifications' },
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications to your email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send important alerts via SMS' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  )
}
