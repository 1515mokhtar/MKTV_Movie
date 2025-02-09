// app/watch/[id]/player/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ReactPlayer from "react-player" // Video player library

export default function PlayerPage() {
  const params = useParams()
  const movieId = params.id
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovieVideo = async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer YOUR_API_KEY",
          },
        }

        const response = await fetch(url, options)
        const data = await response.json()

        // Find the first video (e.g., a trailer or movie clip)
        const video = data.results.find((v: any) => v.type === "Trailer" || v.type === "Clip")
        if (video) {
          setVideoUrl(`https://www.youtube.com/watch?v=${video.key}`) // Use YouTube URL
        } else {
          setVideoUrl(null) // No video found
        }
      } catch (error) {
        console.error("Error fetching movie video:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieVideo()
  }, [movieId])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!videoUrl) {
    return <div className="flex justify-center items-center h-screen">No video available.</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Watch Movie</h1>
      <div className="aspect-video w-full max-w-4xl mx-auto">
        <ReactPlayer
          url={videoUrl}
          controls
          width="100%"
          height="100%"
        />
      </div>
    </div>
  )
}