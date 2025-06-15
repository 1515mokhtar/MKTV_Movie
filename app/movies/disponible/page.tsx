"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { MovieCard } from "@/components/movie-card"
import { useTranslation } from 'react-i18next';

interface TmdbMovie {
  id: number
  title: string
  poster_path: string
  release_date: string
  overview: string
  vote_average?: number
}

export default function MoviesDisponiblePage() {
  const [movies, setMovies] = useState<TmdbMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    console.log("Current language in MoviesDisponiblePage:", i18n.language);
    console.log("Translated title for moviesAvailable.title:", t('moviesAvailable.title'));
    const fetchMovies = async () => {
      setLoading(true)
      setError(null)
      try {
        const snapshot = await getDocs(collection(db, "movies"))
        const ids = snapshot.docs.map(doc => doc.id).filter(id => !!id && id !== "undefined" && id !== "null")
        if (!ids.length) {
          setMovies([])
          setLoading(false)
          return
        }
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
        if (!apiKey) {
          setError("Clé API TMDB manquante.")
          setLoading(false)
          return
        }
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const url = `https://api.themoviedb.org/3/movie/${id}?language=${t('languageCode')}`
              const res = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  accept: "application/json"
                }
              })
              if (!res.ok) {
                return null
              }
              return await res.json()
            } catch (err) {
              return null
            }
          })
        )
        setMovies(results.filter(Boolean))
      } catch (e) {
        setError(t('moviesAvailable.errorLoadingMovies'))
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [t])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">{t('moviesAvailable.title')}</h1>
      {loading && <div>{t('moviesAvailable.loading')}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id.toString()}
            title={movie.title}
            poster={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : undefined}
            genre={""}
            releaseDate={movie.release_date}
            overview={movie.overview}
            rating={movie.vote_average}
          />
        ))}
      </div>
      {!loading && movies.length === 0 && !error && (
        <div className="text-center text-muted-foreground mt-8">{t('moviesAvailable.noMovies')}</div>
      )}
    </div>
  )
} 