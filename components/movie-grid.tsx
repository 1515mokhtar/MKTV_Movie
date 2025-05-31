"use client"

import { useEffect, useState } from "react"
import { MovieCard } from "./movie-card"
import { MovieFilters } from "./movie-filters"
import { Pagination } from "@/components/ui/pagination"
import { db } from '@/lib/firebase'
import { collection, getDocs, query } from 'firebase/firestore'

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

  const fetchMovies = async () => {
    setLoading(true)
    try {
      // Firebase query to fetch all documents from the 'movies' collection
      const moviesCollectionRef = collection(db, 'movies')
      const q = query(moviesCollectionRef)
      const querySnapshot = await getDocs(q)

      const firebaseMovies: Movie[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Map Firebase document data to the Movie interface
        firebaseMovies.push({
          id: doc.id, // Use document id as movie id
          title: data.title,
          type: data.type || 'movie', // Assuming a default type if not present
          releaseDate: data.year ? `${data.year}-01-01` : 'Unknown', // Assuming year field exists
          views: data.views || 0, // Assuming views field exists, default to 0
          poster: data.poster || data.posterPath || '/placeholder.svg', // Using poster or posterPath
          genre: data.category || data.genre || 'Unknown', // Using category or genre field
        })
      })

      // Note: Firebase fetching doesn't inherently provide total_pages like TMDB API.
      // If you need pagination with Firebase, you would implement it differently.
      // For simplicity, we'll just display all fetched movies for now.
      setTotalPages(1) // Setting total pages to 1 as all data is fetched at once

      // Filter and sort movies (existing logic remains)
      const filteredMovies = filterByGenre(firebaseMovies, selectedGenre)
      const filteredByYear = filterByYear(filteredMovies, selectedYear)
      const sortedMovies = sortMovies(filteredByYear, selectedSort)
      const searchedMovies = filterMoviesBySearch(sortedMovies, searchQuery)

      setMovies(searchedMovies)
    } catch (error) {
      console.error("Error fetching movies from Firebase:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    // Removed genres dependency as we are not fetching genres from TMDB for this display
    // The fetchGenres call in the initial useEffect can remain if needed for filters,
    // but it won't affect the movie data itself anymore.
    fetchMovies()
  }, [type, selectedGenre, selectedYear, selectedSort, searchQuery])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }
 console.log("movies", movies)
  return (
    <div className="space-y-6">
      
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
                releaseDate={movie.releaseDate}
                poster={movie.poster}
                id={movie.id}
              />
            ))}
          </div>
          {/* Removed Pagination component as we are not paginating Firebase results this way */}
          {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /> */}
        </>
      )}
    </div>
  )
}