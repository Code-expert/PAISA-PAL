import React, { useState } from 'react'
import { Bell, BellOff, Check, CheckCheck, Trash2, Settings, Filter } from 'lucide-react'
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation 
} from '../services/notificationApi'
import { toast } from 'react-hot-toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import NotificationCenter from '../components/notifications/NotificationCenter'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all') // all, unread, read
  const [showSettings, setShowSettings] = useState(false)

  const { data, isLoading, refetch } = useGetNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()
  const [markAllAsRead] = useMarkAllAsReadMutation()

  const notifications = data?.notifications || []
  const unreadCount = notifications.filter(n => !n.isRead).length

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
              onClick={() => markAllAsRead()}
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

      {/* Notification Center Component */}
      <NotificationCenter />

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Notification Settings"
        size="lg"
      >
        <NotificationSettings onClose={() => setShowSettings(false)} />
      </Modal>
    </div>
  )
}

// Notification Settings Component
function NotificationSettings({ onClose }) {
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
    toast.success('Notification preferences saved')
    onClose()
  }

  return (
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

      <div className="flex space-x-3 pt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save Settings
        </Button>
      </div>
    </div>
  )
}
