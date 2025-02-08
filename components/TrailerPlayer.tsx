"use client"

import { useState, useEffect } from "react"
import ReactPlayer from "react-player"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface VideoTrailerProps {
  videoId: string  // Assurez-vous que c'est bien `videoId` et non `movieId`
  className?: string
  title?: string
  movieId?: string | number
}


export default function VideoTrailer({ movieId, className, title = "Video Trailer" }: VideoTrailerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasClicked, setHasClicked] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        console.log("Fetching trailer for movieId:", movieId)
        const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc'
          }
        }
        const response = await fetch(url, options)
        const data = await response.json()
        console.log("API response:", data) // 🛑 Ajoute ce log pour voir la réponse
  
        if (data.results && data.results.length > 0) {
          const trailer = data.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube")
          if (trailer) {
            console.log("Trailer found:", trailer.key) // 🛑 Vérifie si on trouve une vidéo
            setVideoId(trailer.key)
          } else {
            console.warn("No YouTube trailer found")
          }
        } else {
          console.warn("No videos found for this movie")
        }
      } catch (error) {
        console.error("Error fetching trailer:", error)
      }
    }
  
    fetchTrailer()
  }, [movieId])

  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ""

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 py-8">
      <div className="space-y-4">
        {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
        <div
          className={cn(
            "relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-xl",
            "cursor-pointer transition-transform hover:scale-[1.02]",
            className,
          )}
          onClick={() => {
            setHasClicked(true)
            setIsPlaying(true)
          }}
        >
          {isLoading && <Skeleton className="absolute inset-0 z-10" />}
          {!hasClicked ? (
            <>
              <div className="absolute inset-0 bg-black">
                {videoId && (
                  <img
                    src={thumbnailError ? "/placeholder.svg" : thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover opacity-90"
                    onError={() => setThumbnailError(true)}
                  />
                )}
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-label="Play video"
                className="absolute inset-0 flex items-center justify-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setHasClicked(true)
                    setIsPlaying(true)
                  }
                }}
              >
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border-2 border-white/50 text-white/90 transition-transform hover:scale-110">
                  <Play className="w-10 h-10 fill-current ml-1" />
                </div>
              </div>
            </>
          ) : (
            videoId && (
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${videoId}`}
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={true}
                onReady={() => setIsLoading(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                config={{
                  youtube: {
                    playerVars: {
                      showinfo: 1,
                      rel: 0,
                      modestbranding: 1,
                      playsinline: 1,
                      controls: 1,
                      enablejsapi: 1,
                      origin: window.location.origin,
                    },
                  },
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
