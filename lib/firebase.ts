import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyD0yvbFdM0JWvO_tPqpzAIkai1RDAyueus",
    authDomain: "movis-app-e3f24.firebaseapp.com",
    projectId: "movis-app-e3f24",
    storageBucket: "movis-app-e3f24.firebasestorage.app",
    messagingSenderId: "268427528082",
    appId: "1:268427528082:web:7119536984efbb70c9634b",
    measurementId: "G-3DL6Z8T9XJ"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

