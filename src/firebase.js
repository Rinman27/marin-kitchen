import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Replace these values with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDUWUmTdBfFsiqcyu3sxKq3kmynMyJIJD8",
  authDomain: "marin-kitchen.firebaseapp.com",
  projectId: "marin-kitchen",
  storageBucket: "marin-kitchen.firebasestorage.app",
  messagingSenderId: "741152415576",
  appId: "1:741152415576:web:011304b9ad911feddfcf2d"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Cloudinary config
export const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME"
export const CLOUDINARY_UPLOAD_PRESET = "marin-kitchen"
