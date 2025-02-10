"use client"

import { useEffect, useState } from "react"
import { MovieCard } from "./movie-card"
import { MovieFilters } from "./movie-filters"
import { Pagination } from "@/components/ui/pagination"

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
  searchQuery?: string
}

const filterByGenre = (movies: Movie[], selectedGenre: string): Movie[] => {
  if (selectedGenre === "all") {
    return movies
  }
  return movies.filter((movie) => movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()))
}

const filterByYear = (movies: Movie[], selectedYear: string): Movie[] => {
  if (selectedYear === "all") {
    return movies
  }
  return movies.filter((movie) => movie.releaseDate.startsWith(selectedYear))
}

const sortMovies = (movies: Movie[], selectedSort: string): Movie[] => {
  switch (selectedSort) {
    case "date":
      return [...movies].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    case "views":
      return [...movies].sort((a, b) => b.views - a.views)
    case "rating":
      // Add rating logic here if needed
      return movies
    default:
      return movies
  }
}

const filterMoviesBySearch = (movies: Movie[], query: string): Movie[] => {
  if (!query) return movies // Return all movies if no search query
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  )
}

export function MovieGrid({ type, orderBy = "date", searchQuery = "" }: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<Record<number, string>>({})
  const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([])
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedSort, setSelectedSort] = useState("date")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchGenres = async () => {
    try {
      const response = await fetch("https://api.themoviedb.org/3/genre/movie/list?language=en-US", {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
        },
      })
      const data = await response.json()
      const genreMap = data.genres.reduce(
        (acc: { [x: string]: any }, genre: { id: string | number; name: any }) => {
          acc[genre.id] = genre.name
          return acc
        },
        {} as Record<number, string>,
      )
      setGenres(genreMap)
      setGenreList(data.genres)
    } catch (error) {
      console.error("Error fetching genres:", error)
    }
  }

  const fetchMovies = async (page: number) => {
    setLoading(true)
    try {
      const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`
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
      setTotalPages(data.total_pages)

      // Transform the API data
      const transformedMovies =
        data.results?.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          type: type || (Math.random() > 0.5 ? "movie" : "series"),
          releaseDate: movie.release_date,
          views: Math.floor(Math.random() * 1000000),
          poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : `/placeholder.svg?height=450&width=300&text=${movie.title}`,
          genre: movie.genre_ids.map((id: number) => genres[id] || "Unknown").join(", "),
        })) || []

      // Filter and sort movies
      const filteredMovies = filterByGenre(transformedMovies, selectedGenre)
      const filteredByYear = filterByYear(filteredMovies, selectedYear)
      const sortedMovies = sortMovies(filteredByYear, selectedSort)
      const searchedMovies = filterMoviesBySearch(sortedMovies, searchQuery)

      setMovies(searchedMovies)
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    if (Object.keys(genres).length > 0) {
      fetchMovies(currentPage)
    }
  }, [type, genres, selectedGenre, selectedYear, selectedSort, currentPage, searchQuery])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="space-y-6">
      <MovieFilters
        genres={genreList}
        onGenreChange={setSelectedGenre}
        onYearChange={setSelectedYear}
        onSortChange={setSelectedSort}
      />
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
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
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}