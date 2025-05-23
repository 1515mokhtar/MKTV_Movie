"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MovieCard } from "./movie-card"
import { useEffect, useState } from "react"
import { MovieFilters } from "./movie-filters"

interface Movie {
  id: string
  title: string
  type: "movie" | "series"
  releaseDate: string
  views: number
  poster: string
  genre: string
}

interface MovieGridProps {
  type?: "movie" | "series"
  orderBy?: "date" | "views" | "rating"
}

export function MovieCarousel() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<Record<number, string>>({}) // Genre mapping: { id: name }
  const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([]) // List of genres
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedSort, setSelectedSort] = useState("date")

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const url = "https://api.themoviedb.org/3/genre/movie/list?language=en-US"
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        }

        const response = await fetch(url, options)
        const data = await response.json()
        const genreMap = data.genres.reduce((acc: Record<number, string>, genre: any) => {
          acc[genre.id] = genre.name
          return acc
        }, {})
        setGenres(genreMap)
        setGenreList(data.genres)
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }

    fetchGenres()
  }, [])

  // Fetch movies
  useEffect(() => {
    const getMovies = async () => {
      setLoading(true)
      try {
        const url = "https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=1"
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        }

        const response = await fetch(url, options)
        const data = await response.json()

        // Transform the API data to match the Movie type structure
        const transformedMovies = data.results.slice(0, 10).map((movie: any, index: number) => ({
          id: movie.id.toString(),
          title: movie.title,
          type: "movie", // Default to "movie" since this is a movie API
          releaseDate: movie.release_date,
          views: Math.floor(Math.random() * 1000000), // Random views for demonstration
          poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : `/placeholder.svg?height=450&width=300&text=${index + 1}`,
          genre: movie.genre_ids
            .map((id: number) => genres[id] || "Unknown") // Map genre_ids to genre names
            .join(", "), // Join multiple genres into a single string
        }))

        setMovies(transformedMovies)
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    if (Object.keys(genres).length > 0) {
      getMovies()
    }
  }, [genres])

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="relative px-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {movies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
              <div className="transform transition-all duration-300 hover:scale-105">
                <MovieCard
                  title={movie.title}
                  genre={movie.genre}
                  releaseDate={new Date(movie.releaseDate).getFullYear().toString()}
                  poster={movie.poster}
                  id={movie.id}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70" />
        <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70" />
      </Carousel>
    </div>
  )
}