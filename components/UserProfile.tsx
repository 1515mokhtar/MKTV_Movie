"use client"

import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import type { User } from "firebase/auth"
import type React from "react" // Added import for React

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [preferences, setPreferences] = useState("")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setName(userData.name || "")
          setPreferences(userData.preferences || "")
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        name,
        preferences,
        email: user.email,
      })
      alert("Profile updated successfully!")
    }
  }

  if (!user) {
    return <div>Please sign in to view your profile.</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="preferences" className="block text-sm font-medium text-gray-300">
          Preferences
        </label>
        <textarea
          id="preferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
        Update Profile
      </button>
    </form>
  )
}

