import { useState, useEffect } from 'react'

interface SimilarMovie {
  id: number
  title: string
  poster_path: string
  release_date: string
}

export function useSimilarMovies(movieId: string) {
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movieId) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching similar movies for movieId:", movieId)
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch similar movies: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Similar movies data:", data)
        
        if (data.results && Array.isArray(data.results)) {
          setSimilarMovies(data.results)
        } else {
          setSimilarMovies([])
        }
      } catch (err) {
        console.error("Error fetching similar movies:", err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching similar movies')
        setSimilarMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarMovies()
  }, [movieId])

  return { similarMovies, loading, error }
} 