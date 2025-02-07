"use client"

import { useEffect, useState } from "react"

interface MovieTrailerProps {
  movieId: string
}

export function MovieTrailer({ movieId }: MovieTrailerProps) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch trailer URL from API
    const fetchTrailer = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=4781aa55a1bf3c6ef05ee0bc0a94fcbc`
        )
        const data = await response.json()
        const trailer = data.results.find((video: any) => video.type === "Trailer")
        setTrailerUrl(trailer ? `https://www.youtube.com/embed/${trailer.key}` : null)
      } catch (error) {
        console.error("Error fetching trailer:", error)
      }
    }

    fetchTrailer()
  }, [movieId])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Trailer</h2>
      {trailerUrl ? (
        <iframe
          src={trailerUrl}
          className="w-full h-64 lg:h-96"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <p>No trailer available.</p>
      )}
    </div>
  )
}