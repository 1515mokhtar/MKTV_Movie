"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Star, Film } from "lucide-react"
import VideoTrailer from "@/components/TrailerPlayer"

interface Movie {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string
  backdrop_path: string
  genres: { id: number; name: string }[]
  runtime: number
  vote_average: number
  tagline?: string
}

interface MovieDetailsProps {
  params: { id: string }
}

export default function MovieDetails({ params }: MovieDetailsProps) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  const movieId = Number.parseInt(params.id, 10)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        }

        const response = await fetch(url, options)
        const data = await response.json()
        setMovie(data)
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movieId])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!movie) {
    return <div className="flex justify-center items-center h-screen">Movie not found.</div>
  }

  return (
    <div className="relative min-h-screen bg-gray-900  flex justify-center items-center text-white">
      {/* Backdrop Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-sm"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
      ></div>

      <div className="relative z-10 container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster */}
          <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-grow space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{movie.title}</h1>

            {movie.tagline && <p className="text-lg md:text-xl text-gray-300 italic">{movie.tagline}</p>}

            <p className="text-gray-300 text-base md:text-lg">{movie.overview}</p>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>{movie.runtime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>{movie.vote_average.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="truncate">{movie.genres.map((genre) => genre.name).join(", ")}</span>
              </div>
            </div>

            {/* Trailer Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition-all">
                  Watch Trailer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <VideoTrailer movieId={String(movieId)} title={movie.title} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

