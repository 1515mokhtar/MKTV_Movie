"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MovieCard } from "./movie-card"
import { useEffect, useState } from "react"
import { MovieFilters } from "./movie-filters"
import { type } from "os"

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
    const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([]) // List of genr
    const [selectedGenre, setSelectedGenre] = useState("all")
    const [selectedYear, setSelectedYear] = useState("2024")
    const [selectedSort, setSelectedSort] = useState("date")
  
  
  
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
          const response = await fetch(
            "https://api.themoviedb.org/3/discover/movie?api_key=4781aa55a1bf3c6ef05ee0bc0a94fcbc"
          )
          const data = await response.json()
  
          // Transform the API data to match the Movie type structure
          const transformedMovies = data.results.map((movie: any, index: number) => ({
            id: movie.id,
            title: movie.title,
            type: type || (Math.random() > 0.5 ? "movie" : "series"),
            releaseDate: movie.release_date,
            views: Math.floor(Math.random() * 1000000),
            poster: movie.poster_path
              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
              : `/placeholder.svg?height=450&width=300&text=${index + 1}`,
            genre: movie.genre_ids
              .map((id: number) => genres[id] || "Unknown") // Map genre_ids to genre names
              .join(", "), // Join multiple genres into a single string
          }))
           
          // Filter by genre
          const filteredMovies = selectedGenre === "all"
            ? transformedMovies
            : transformedMovies.filter((movie: { genre: string }) => movie.genre.toLowerCase().includes(selectedGenre
            ))
              // Filter by type if specified
          // const filteredMovies = type
          //   ? transformedMovies.filter((movie: { type: string }) => movie.type === type)
          //   : transformedMovies
  
          // Filter by year
          const filteredByYear = selectedYear === "all"
            ? filteredMovies
            : filteredMovies.filter((movie: { releaseDate: string | number | Date }) => new Date(movie.releaseDate).getFullYear().toString() === selectedYear)
  
          // Sort movies
          const sortedMovies = filteredByYear.sort((a: { releaseDate: string | number | Date; views: number; title: string }, b: { releaseDate: string | number | Date; views: number; title: any }) => {
            switch (selectedSort) {
              case "date":
                return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
              case "rating":
                return b.views - a.views // Replace with actual rating logic if available
              case "views":
                return b.views - a.views
              case "name":
                return a.title.localeCompare(b.title)
              default:
                return 0
            }
          })
  
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
  

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
      {movies.map((movie) => (
          <CarouselItem key={movie.id} className="pl-2 md:pl-4 md:basis-1/4 lg:basis-1/5">
          
        <MovieCard
          key={movie.id}
          title={movie.title}
          genre={movie.genre}
          releaseDate={new Date(movie.releaseDate).getFullYear().toString()}
          poster={movie.poster}
          id={movie.id}
        />
    
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

