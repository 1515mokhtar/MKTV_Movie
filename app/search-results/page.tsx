"use client"

import type React from "react"

import  Header  from "@/components/header"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Film, Tv, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface SearchResult {
  id: number
  title?: string
  name?: string
  poster_path: string
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
  media_type: string
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [movieResults, setMovieResults] = useState<SearchResult[]>([])
  const [tvResults, setTvResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setMovieResults([])
      setTvResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const movieUrl = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`
      const tvUrl = `https://api.themoviedb.org/3/search/tv?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
        },
      }

      const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl, options), fetch(tvUrl, options)])

      if (!movieResponse.ok || !tvResponse.ok) {
        throw new Error("Failed to fetch search results")
      }

      const movieData = await movieResponse.json()
      const tvData = await tvResponse.json()

      const movies = movieData.results.map((movie: any) => ({
        ...movie,
        media_type: "movie",
      }))

      const tvShows = tvData.results.map((show: any) => ({
        ...show,
        media_type: "tv",
      }))

      // Combine and sort by popularity
      const allResults = [...movies, ...tvShows].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

      setResults(allResults)
      setMovieResults(movies)
      setTvResults(tvShows)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const getDisplayResults = () => {
    switch (activeTab) {
      case "movies":
        return movieResults
      case "tv":
        return tvResults
      default:
        return results
    }
  }

  const displayResults = getDisplayResults()

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Résultats de recherche</h1>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="search"
              placeholder="Rechercher des films et séries..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Rechercher
            </Button>
          </form>

          {error && <div className="p-4 mb-6 text-center text-red-500 bg-red-50 rounded-md">{error}</div>}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tous ({results.length})</TabsTrigger>
              <TabsTrigger value="movies">
                <Film className="h-4 w-4 mr-2" />
                Films ({movieResults.length})
              </TabsTrigger>
              <TabsTrigger value="tv">
                <Tv className="h-4 w-4 mr-2" />
                Séries ({tvResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ResultsGrid results={results} />
            </TabsContent>

            <TabsContent value="movies" className="mt-0">
              <ResultsGrid results={movieResults} />
            </TabsContent>

            <TabsContent value="tv" className="mt-0">
              <ResultsGrid results={tvResults} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function ResultsGrid({ results }: { results: SearchResult[] }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Aucun résultat trouvé</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((result) => (
        <ResultCard key={`${result.media_type}-${result.id}`} result={result} />
      ))}
    </div>
  )
}

function ResultCard({ result }: { result: SearchResult }) {
  const isMovie = result.media_type === "movie"
  const title = isMovie ? result.title : result.name
  const date = isMovie ? result.release_date : result.first_air_date
  const year = date ? new Date(date).getFullYear() : "N/A"
  const detailUrl = isMovie ? `/movies/${result.id}` : `/series/${result.id}`

  // Format rating to one decimal place
  const rating = result.vote_average ? (Math.round(result.vote_average * 10) / 10).toFixed(1) : "N/A"

  return (
    <Link href={detailUrl}>
      <div className="group rounded-lg overflow-hidden border bg-card text-card-foreground shadow transition-all hover:shadow-lg">
        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
          {result.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
              alt={title}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {isMovie ? (
                <Film className="h-16 w-16 text-muted-foreground opacity-20" />
              ) : (
                <Tv className="h-16 w-16 text-muted-foreground opacity-20" />
              )}
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 text-xs font-medium backdrop-blur-sm">
            {isMovie ? (
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                Film
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Tv className="h-3 w-3" />
                Série
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{title}</h3>
          <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
            <span>{year}</span>
            <span className="flex items-center">★ {rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

