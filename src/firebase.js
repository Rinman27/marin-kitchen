import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Replace these values with your own Firebase project config
// You will get these from Firebase Console > Project Settings > Your Apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Cloudinary config — replace with your own values
// You will get these from cloudinary.com > Settings > Upload > Upload presets
export const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME"
export const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"
