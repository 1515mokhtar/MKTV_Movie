"use client"

import { useState } from "react"
import ReactPlayer from "react-player"

export default function TrailerPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="aspect-video relative">
      <ReactPlayer
        url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        width="100%"
        height="100%"
        playing={isPlaying}
        controls={true}
        light="/placeholder.svg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  )
}

