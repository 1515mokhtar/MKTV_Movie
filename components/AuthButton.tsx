"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { signInWithPopup, GoogleAuthProvider, signOut, type User } from "firebase/auth"
import { motion } from "framer-motion"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()

    // Set the correct origin based on the current URL
    let origin = window.location.origin
    if (origin.includes("192.168.11.103")) {
      origin = "http://my-local-movies.com:3000"
    }

    provider.setCustomParameters({
      prompt: "select_account",
      origin: origin,
    })

    try {
      await signInWithPopup(auth, provider)
      setError(null)
    } catch (error: any) {
      console.error("Error signing in with Google", error)
      if (error.code === "auth/unauthorized-domain") {
        setError("Unauthorized domain. Please ensure you're using localhost:3000 or my-local-movies.com:3000")
      } else {
        setError("An error occurred while signing in. Please try again.")
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setError(null)
    } catch (error) {
      console.error("Error signing out", error)
      setError("An error occurred while signing out. Please try again.")
    }
  }

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center space-x-4"
      >
        <img src={user.photoURL || undefined} alt={user.displayName || "User"} className="w-8 h-8 rounded-full" />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="bg-primary text-text px-4 py-2 rounded"
        >
          Sign Out
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={signIn}
        className="bg-primary text-text px-4 py-2 rounded"
      >
        Sign In with Google
      </motion.button>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

