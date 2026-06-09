import React, { useState } from 'react'
import { Settings, Moon, Sun, Globe, Bell, Shield, Download, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { selectDarkMode, toggleDarkMode } from '../store/slices/uiSlice'
import { toast } from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import NotificationButton from '../components/notifications/NotificationButton' // ✅ ADD THIS

const CURRENCIES = [
  { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
  { value: 'INR', label: '🇮🇳 Indian Rupee (INR)' },
  { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' }
]

const LANGUAGES = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'de', label: '🇩🇪 German' },
  { value: 'hi', label: '🇮🇳 Hindi' }
]

export default function SettingsPage() {
  const darkMode = useSelector(selectDarkMode)
  const dispatch = useDispatch()
  
  const [settings, setSettings] = useState({
    currency: 'USD',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'US',
    autoBackup: true,
    dataSharing: false
  })

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
    toast.success('Setting updated')
  }

  const handleExportData = () => {
    toast.info('Data export started. You will receive an email when ready.')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion feature coming soon')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Settings
        </h1>
        <p className="text-on-surface-variant mt-1">
          Customize your PaisaPal experience
        </p>
      </div>

      {/* ✅ NEW: Notifications Settings */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-secondary" />
            Notifications
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-on-surface">
                  Push Notifications
                </h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  Get real-time alerts for budgets, bills, and transactions even when the app is closed
                </p>
                <div className="mt-2 text-xs text-on-surface-variant">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Budget alerts when you approach limits</li>
                    <li>Bill reminders before due dates</li>
                    <li>Transaction confirmations</li>
                    <li>Goal achievement notifications</li>
                  </ul>
                </div>
              </div>
              <div className="ml-4">
                {/* ✅ ADD NOTIFICATION BUTTON HERE */}
                <NotificationButton />
              </div>
            </div>

            {/* Notification Preferences - Only show if permission granted */}
            {Notification.permission === 'granted' && (
              <div className="border-t border-outline-variant/30 pt-4 mt-4">
                <h5 className="text-sm font-medium text-on-surface mb-3">
                  Notification Preferences
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">
                      Budget Alerts
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">
                      Bill Reminders
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">
                      Transaction Updates
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">
                      Goal Achievements
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Appearance */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            {darkMode ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
            Appearance
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-on-surface">
                  Dark Mode
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Switch between light and dark themes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => dispatch(toggleDarkMode())}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Localization */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Localization
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Currency
              </label>
              <Select
                value={settings.currency}
                onChange={(value) => handleSettingChange('currency', value)}
                options={CURRENCIES}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Language
              </label>
              <Select
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                options={LANGUAGES}
              />
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy & Security
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-on-surface">
                  Auto Backup
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Automatically backup your data to cloud storage
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-on-surface">
                  Data Sharing
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Share anonymized data to help improve our services
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dataSharing}
                  onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card>
        <Card.Header>
          <Card.Title>Data Management</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-on-surface">
                  Export Data
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Download all your data in CSV format
                </p>
              </div>
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportData}
              >
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">
                  Delete Account
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={handleDeleteAccount}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
