"use client"

import { useEffect, useState } from "react"

interface MovieDescriptionProps {
  movieId: string
}

export function MovieDescription({ movieId }: MovieDescriptionProps) {
  const [movie, setMovie] = useState<any>(null)

  useEffect(() => {
    // Fetch movie details from API
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=4781aa55a1bf3c6ef05ee0bc0a94fcbc`
        )
        const data = await response.json()
        setMovie(data)
      } catch (error) {
        console.error("Error fetching movie details:", error)
      }
    }

    fetchMovieDetails()
  }, [movieId])

  if (!movie) return <p>Loading...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Description</h2>
      <p className="text-gray-700">{movie.overview}</p>
    </div>
  )
}