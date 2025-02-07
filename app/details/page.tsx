"use client"

import { motion } from "framer-motion"
import VideoPlayer from "@/components/VideoPlayer"
import TrailerPlayer from "@/components/TrailerPlayer"
import AuthButton from "@/components/AuthButton"
import UserProfile from "@/components/UserProfile"

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-text p-4"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <VideoPlayer />

        <UserProfile />
      </div>
    </motion.main>
  )
}

