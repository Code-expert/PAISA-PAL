import admin from 'firebase-admin';
import FcmToken from '../models/FcmToken.js';

if (!admin.apps.length && process.env.FIREBASE_SERVER_KEY) {
  try {
    // Only initialize if we have a valid Firebase service account key
    const firebaseKey = JSON.parse(process.env.FIREBASE_SERVER_KEY);
    if (firebaseKey.private_key && !firebaseKey.private_key.includes('YOUR_PRIVATE_KEY')) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseKey),
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.log('Firebase disabled: Using placeholder credentials');
    }
  } catch (error) {
    console.log('Firebase disabled: Invalid credentials format');
  }
}

const sendPush = async (userId, title, body, link = '')=> {
  // Skip if Firebase is not initialized
  if (!admin.apps.length) {
    console.log('Push notification skipped: Firebase not initialized');
    return;
  }
  
  const tokens = (await FcmToken.find({ user: userId })).map(t => t.token);
  if (!tokens.length) return;
  const message = {
    notification: { title, body },
    data: link ? { link } : {},
    tokens,
  }; 
  await admin.messaging().sendMulticast(message);
};

export default sendPush; 