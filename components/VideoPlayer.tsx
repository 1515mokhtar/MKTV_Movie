"use client"

import { useState } from "react"
import ReactPlayer from "react-player"

interface VideoPlayerProps {
  url: string
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="aspect-video relative">
      <ReactPlayer
        url={url}
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

