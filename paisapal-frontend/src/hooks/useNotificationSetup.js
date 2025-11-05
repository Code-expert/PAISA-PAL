// hooks/useNotificationSetup.js
import { useSaveFcmTokenMutation } from '../services/fcmApi'
import { messaging } from '../firebase'
import { getToken } from 'firebase/messaging'
import { toast } from 'react-hot-toast'

export const useNotificationSetup = () => {
  const [saveFcmToken] = useSaveFcmTokenMutation()

  // ✅ Helper function to wait for service worker to be active
  const waitForServiceWorkerActive = async (registration) => {
    if (registration.active) {
      return registration
    }

    return new Promise((resolve) => {
      const serviceWorker = registration.installing || registration.waiting

      if (serviceWorker) {
        serviceWorker.addEventListener('statechange', (event) => {
          if (event.target.state === 'activated') {
            resolve(registration)
          }
        })
      }
    })
  }

  const requestNotificationPermission = async () => {
    try {
      if (!messaging) {
        toast.error('Firebase messaging not initialized')
        return { success: false, error: 'Messaging not available' }
      }

      console.log('🔔 Requesting notification permission...')
      
      // Check current permission
      if (Notification.permission === 'denied') {
        console.log('❌ Permission denied')
        toast.error('Notification permission is blocked. Please enable in browser settings.')
        return { success: false, error: 'Permission denied' }
      }

      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        console.log('📝 Asking for permission...')
        const permission = await Notification.requestPermission()
        
        if (permission !== 'granted') {
          console.log('❌ User denied permission')
          toast.error('Notification permission denied')
          return { success: false, error: 'Permission denied by user' }
        }
      }

      console.log('✅ Permission granted, registering service worker...')

      // ✅ STEP 1: Register the service worker with Firebase config
      const swUrl = `/firebase-messaging-sw.js?${new URLSearchParams({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      }).toString()}`

      let swRegistration = await navigator.serviceWorker.getRegistration()
      
      if (!swRegistration) {
        console.log('📝 Registering service worker...')
        swRegistration = await navigator.serviceWorker.register(swUrl, {
          scope: '/'
        })
      }

      // ✅ STEP 2: Wait for service worker to be active
      console.log('⏳ Waiting for service worker to activate...')
      await waitForServiceWorkerActive(swRegistration)
      
      // ✅ STEP 3: Wait a bit more for safety
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('✅ Service worker is active')

      // ✅ STEP 4: Now get the FCM token
      console.log('🔑 Getting FCM token...')
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      })

      if (token) {
        console.log('✅ Got FCM token:', token)
        
        // Save token to backend
        await saveFcmToken({ token }).unwrap()
        toast.success('Notifications enabled! 🔔')
        
        return { success: true, token }
      } else {
        console.log('❌ No token received')
        toast.error('Failed to get notification token')
        return { success: false, error: 'No token received' }
      }

    } catch (error) {
      console.error('❌ Notification setup failed:', error)
      toast.error('Failed to enable notifications: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  return { requestNotificationPermission }
}
