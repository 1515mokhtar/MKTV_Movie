"use client"

import { useEffect, useState } from "react"

interface Movie {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string
  genres: { id: number; name: string }[]
  runtime: number
  vote_average: number
}

interface MovieDetailsProps {
  params: { id: string }
}

export default function MovieDetails({ params }: MovieDetailsProps) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  const movieId = parseInt(params.id, 10)

  if (isNaN(movieId)) {
    console.error("Invalid movie ID:", params.id)
    return <div>Invalid movie ID.</div>
  }

  // Debugging: Log the movieId
  console.log("Movie ID:", movieId, "Type:", typeof movieId)

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc'
          }
        };

        const response = await fetch(url, options)
        const data = await response.json()
        setMovie({
          id: data.id,
          title: data.title,
          overview: data.overview,
          release_date: data.release_date,
          poster_path: data.poster_path,
          genres: data.genres,
          runtime: data.runtime,
          vote_average: data.vote_average,
        })
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movieId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!movie) {
    return <div>Movie not found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Poster Section */}
        <div>
          <img
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            className="w-full rounded-lg"
          />
        </div>

        {/* Details Section */}
        <div>
          <p className="text-gray-700">{movie.overview}</p>
          <p className="mt-4 text-gray-600">
            <strong>Release Date:</strong> {movie.release_date}
          </p>
          <p className="mt-2 text-gray-600">
            <strong>Genres:</strong> {movie.genres.map((genre) => genre.name).join(", ")}
          </p>
          <p className="mt-2 text-gray-600">
            <strong>Runtime:</strong> {movie.runtime} minutes
          </p>
          <p className="mt-2 text-gray-600">
            <strong>Rating:</strong> {movie.vote_average}/10
          </p>
        </div>
      </div>
    </div>
  )
}