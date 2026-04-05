import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Replace these values with your own Firebase project config
// You will get these from Firebase Console > Project Settings > Your Apps
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

// Cloudinary config — replace with your own values
// You will get these from cloudinary.com > Settings > Upload > Upload presets
export const CLOUDINARY_CLOUD_NAME = "dak8tsbri"
export const CLOUDINARY_UPLOAD_PRESET = "marin-kitchen"
