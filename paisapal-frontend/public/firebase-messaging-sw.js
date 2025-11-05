importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')

// ✅ Get config from URL query params (we'll pass them during registration)
// This allows us to use env variables without hardcoding
const urlParams = new URLSearchParams(self.location.search)

const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
}

// Only initialize if we have config
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload)
    
    const notificationTitle = payload.notification?.title || 'PaisaPal Notification'
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/icon.png',
      badge: '/badge.png',
      data: payload.data,
      tag: payload.data?.notificationId || 'default',
      requireInteraction: false
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
  })
} else {
  console.warn('[firebase-messaging-sw.js] No Firebase config provided')
}
