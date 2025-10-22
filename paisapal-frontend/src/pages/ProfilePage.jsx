import React, { useState } from 'react'
import { User, Mail, Phone, Calendar, Shield, Camera, Save } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/slices/authSlice'
import { useUpdateProfileMutation } from '../services/userApi'
import { toast } from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    occupation: user?.occupation || '',
    bio: user?.bio || ''
  })

  const [profileImage, setProfileImage] = useState(user?.photo || null)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // ✅ Build payload with only non-empty fields
      const payload = {
        name: formData.name,
        email: formData.email,
      }
      
      // Add optional fields only if they have values
      if (formData.phone && formData.phone.trim() !== '') {
        payload.phone = formData.phone
      }
      
      if (formData.dateOfBirth) {
        payload.dateOfBirth = formData.dateOfBirth
      }
      
      if (formData.occupation && formData.occupation.trim() !== '') {
        payload.occupation = formData.occupation
      }
      
      if (formData.bio && formData.bio.trim() !== '') {
        payload.bio = formData.bio
      }
      
      if (profileImage && profileImage !== user?.photo) {
        payload.photo = profileImage
      }
      
      await updateProfile(payload).unwrap()
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update profile')
      console.error('Profile update error:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <Card>
          <Card.Header>
            <Card.Title>Profile Picture</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar
                  src={profileImage}
                  alt={user?.name}
                  size="xl"
                  className="mx-auto"
                />
                <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    leftIcon={<User className="w-4 h-4" />}
                    required
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                    disabled={user?.googleId}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number (Optional)"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    leftIcon={<Phone className="w-4 h-4" />}
                    placeholder="+1234567890"
                  />
                  
                  <Input
                    label="Date of Birth (Optional)"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                </div>

                <Input
                  label="Occupation (Optional)"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="Software Engineer, Teacher, etc."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <Button
                  type="submit"
                  loading={isLoading}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="w-full"
                >
                  Update Profile
                </Button>
              </form>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Account Security */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Account Security
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Password
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.googleId 
                  ? 'You sign in with Google, so no password is needed.'
                  : 'Last changed 30 days ago'
                }
              </p>
              {!user?.googleId && (
                <Button variant="secondary" size="sm">
                  Change Password
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
              <Button variant="secondary" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
