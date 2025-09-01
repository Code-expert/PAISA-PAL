import React, { useState } from 'react'
import { Settings, Moon, Sun, Globe, Bell, Shield, Download, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { selectDarkMode, toggleDarkMode } from '../store/slices/uiSlice'
import { toast } from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your PaisaPal experience
        </p>
      </div>

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
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <Select
                value={settings.currency}
                onChange={(value) => handleSettingChange('currency', value)}
                options={CURRENCIES}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Auto Backup
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Data Sharing
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Export Data
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
