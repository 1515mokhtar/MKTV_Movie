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
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch similar movies')
        }

        const data = await response.json()
        setSimilarMovies(data.results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (movieId) {
      fetchSimilarMovies()
    }
  }, [movieId])

  return { similarMovies, loading, error }
} 