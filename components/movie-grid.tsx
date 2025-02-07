"use client"

import { useEffect, useState } from "react"
import { MovieCard } from "./movie-card"
import { MovieFilters } from "./movie-filters"

interface Movie {
  id: number
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

// Utility functions
const filterByGenre = (movies: Movie[], genre: string) => {
  return genre === "all"
    ? movies
    : movies.filter((movie) => movie.genre.toLowerCase().includes(genre));
};

const filterByYear = (movies: Movie[], year: string) => {
  return year === "all"
    ? movies
    : movies.filter((movie) => new Date(movie.releaseDate).getFullYear().toString() === year);
};

const sortMovies = (movies: Movie[], sortBy: string) => {
  return movies.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      case "rating":
        return b.views - a.views;
      case "views":
        return b.views - a.views;
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
};

export function MovieGrid({ type, orderBy = "date" }: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<Record<number, string>>({})
  const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([])
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedSort, setSelectedSort] = useState("date")
  const [apiResponse, setApiResponse] = useState<any>(null) // Store the entire API response

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          "https://api.themoviedb.org/3/genre/movie/list?api_key=4781aa55a1bf3c6ef05ee0bc0a94fcbc"
        )
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
        const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc'
          }
        };

        const response = await fetch(url, options)
        const data = await response.json()
        setApiResponse(data) // Store the entire API response

        // Transform the API data
        const transformedMovies = data.results?.map((movie: any, index: number) => ({
          id: movie.id, // <-- id is a number
          title: movie.title,
          type: type || (Math.random() > 0.5 ? "movie" : "series"),
          releaseDate: movie.release_date,
          views: Math.floor(Math.random() * 1000000),
          poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : `/placeholder.svg?height=450&width=300&text=${index + 1}`,
          genre: movie.genre_ids
            .map((id: number) => genres[id] || "Unknown")
            .join(", "),
        })) || []

        // Filter and sort movies
        const filteredMovies = filterByGenre(transformedMovies, selectedGenre)
        const filteredByYear = filterByYear(filteredMovies, selectedYear)
        const sortedMovies = sortMovies(filteredByYear, selectedSort)

        setMovies(sortedMovies)
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    if (Object.keys(genres).length > 0) {
      getMovies()
    }
  }, [type, genres, selectedGenre, selectedYear, selectedSort])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <MovieFilters
        genres={genreList}
        onGenreChange={setSelectedGenre}
        onYearChange={setSelectedYear}
        onSortChange={setSelectedSort}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            genre={movie.genre}
            releaseDate={new Date(movie.releaseDate).getFullYear().toString()}
            poster={movie.poster}
            id={movie.id}
          />
        ))}
      </div>
    </>
  )
}