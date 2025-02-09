"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  genres: { id: number; name: string }[]
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
}

export default function MovieDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      try {
        // First, try to fetch as a movie
        let url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`
        let response = await fetch(url, {
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        })

        if (!response.ok) {
          // If not found as a movie, try as a TV series
          url = `https://api.themoviedb.org/3/tv/${id}?language=en-US`
          response = await fetch(url, {
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
            },
          })

          if (!response.ok) {
            throw new Error("Movie or series not found")
          }
        }

        const data = await response.json()
        setDetails(data)
      } catch (err) {
        setError("Failed to fetch details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDetails()
    }
  }, [id])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error || !details) {
    return <div className="flex justify-center items-center h-screen">Error: {error || "Failed to load details"}</div>
  }

  const isMovie = "runtime" in details

  const handleWatchClick = () => {
    router.push(`/watch/${id}/player`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img
            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
            alt={details.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{details.title}</h1>
          <p className="text-gray-600 mb-4">{details.overview}</p>
          <div className="mb-4">
            <span className="font-semibold">Genre:</span> {details.genres.map((g) => g.name).join(", ")}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Release Date:</span> {details.release_date}
          </div>
          {isMovie ? (
            <div className="mb-4">
              <span className="font-semibold">Runtime:</span> {details.runtime} minutes
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="font-semibold">Seasons:</span> {details.number_of_seasons}
              </div>
              <div className="mb-4">
                <span className="font-semibold">Episodes:</span> {details.number_of_episodes}
              </div>
            </>
          )}
          <Button
            onClick={handleWatchClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            {isMovie ? "Watch Movie" : "Watch Series"}
          </Button>
        </div>
      </div>
    </div>
  )
}

