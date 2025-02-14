"use client"

import { useEffect, useState } from "react"
import { SeriesCard } from "./series-card"
import { SeriesFilters } from "./series-filters"
import { Pagination } from "@/components/ui/pagination"

interface Series {
  id: number
  title: string
  type: "movie" | "series"
  releaseDate: string
  views: number
  poster: string
  genre: string
}

interface SeriesGridProps {
  type?: "movie" | "series"
  orderBy?: "date" | "views" | "rating"
  searchQuery?: string
}

const filterByGenre = (series: Series[], selectedGenre: string): Series[] => {
  if (selectedGenre === "all") {
    return series
  }
  return series.filter((item) => item.genre.toLowerCase().includes(selectedGenre.toLowerCase()))
}

const filterByYear = (series: Series[], selectedYear: string): Series[] => {
  if (selectedYear === "all") {
    return series
  }
  return series.filter((item) => item.releaseDate.startsWith(selectedYear))
}

const sortSeries = (series: Series[], selectedSort: string): Series[] => {
  switch (selectedSort) {
    case "date":
      return [...series].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    case "views":
      return [...series].sort((a, b) => b.views - a.views)
    case "rating":
      // Add rating logic here if needed
      return series
    default:
      return series
  }
}

const filterSeriesBySearch = (series: Series[], query: string): Series[] => {
  if (!query) return series
  return series.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
}

export function SeriesGrid({ type, orderBy = "date", searchQuery = "" }: SeriesGridProps) {
  const [series, setSeries] = useState<Series[]>([])
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
      const response = await fetch("https://api.themoviedb.org/3/genre/tv/list?language=en-US", {
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

  const fetchSeries = async (page: number) => {
    setLoading(true)
    try {
      const url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`
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
      const transformedSeries =
        data.results?.map((item: any) => ({
          id: item.id,
          title: item.name,
          type: "series",
          releaseDate: item.first_air_date,
          views: Math.floor(Math.random() * 1000000),
          poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
            : `/placeholder.svg?height=450&width=300&text=${item.name}`,
          genre: item.genre_ids.map((id: number) => genres[id] || "Unknown").join(", "),
        })) || []

      // Filter and sort series
      const filteredSeries = filterByGenre(transformedSeries, selectedGenre)
      const filteredByYear = filterByYear(filteredSeries, selectedYear)
      const sortedSeries = sortSeries(filteredByYear, selectedSort)
      const searchedSeries = filterSeriesBySearch(sortedSeries, searchQuery)

      setSeries(searchedSeries)
    } catch (error) {
      console.error("Error fetching series:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    if (Object.keys(genres).length > 0) {
      fetchSeries(currentPage)
    }
  }, [type, genres, selectedGenre, selectedYear, selectedSort, currentPage, searchQuery])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="space-y-6">
      <SeriesFilters
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
            {series.map((item) => (
              <SeriesCard
                key={item.id}
                id={item.id}
                title={item.title}
                genre={item.genre}
                releaseDate={new Date(item.releaseDate).getFullYear().toString()}
                poster={item.poster}
              />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

