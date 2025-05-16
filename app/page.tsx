"use client"

import { HeroSection } from "@/components/hero-section"
import { MovieCarousel } from "@/components/movie-carousel"
import { MovieGrid } from "@/components/movie-grid"
import { CategoryTabs } from "@/components/category-tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from "@/components/carousel"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Movie {
  id: number
  title: string
  backdrop_path: string
  overview: string
}

export default function Home() {
  const router = useRouter()
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        )
        const data = await response.json()
        setTrendingMovies(data.results.slice(0, 10))
      } catch (error) {
        console.error("Error fetching trending movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingMovies()
  }, [])

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative w-full flex items-center justify-center text-center bg-gradient-to-b from-primary/10 to-background/90"
          style={{ minHeight: trendingMovies.length === 0 ? '60vh' : '80vh' }}
        >
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : trendingMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full px-4 py-12 sm:py-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Bienvenue sur MKTV</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">Découvrez et regardez vos films préférés en streaming HD.</p>
              <p className="text-sm sm:text-base text-muted-foreground">Aucun film tendance à afficher pour le moment.</p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full h-full"
            >
              <CarouselContent className="h-full">
                {trendingMovies.map((movie) => (
                  <CarouselItem key={movie.id} className="h-full">
                    <div className="relative h-full w-full">
                      <img
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                      <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-4">
                          <div className="max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                              {movie.title}
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-200 mb-6 line-clamp-3">
                              {movie.overview}
                            </p>
                            <div className="flex gap-4">
                              <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => router.push(`/watch/${movie.id}`)}
                              >
                                Watch Now
                              </Button>
                              <Button
                                size="lg"
                                variant="outline"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                onClick={() => router.push(`/movies/${movie.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <CarouselDots />
              </div>
            </Carousel>
          )}
        </section>

        {/* Main Content */}
        <div className="container space-y-16 py-16">
          {/* Services Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="container relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Why Choose MKTV?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Experience the best streaming platform with our premium features
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-background/50 backdrop-blur-sm p-6 rounded-lg border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">HD Quality</h3>
                  <p className="text-muted-foreground">
                    Watch your favorite movies and shows in stunning HD quality
                  </p>
                </div>
                <div className="bg-background/50 backdrop-blur-sm p-6 rounded-lg border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Customizable</h3>
                  <p className="text-muted-foreground">
                    Personalize your viewing experience with our advanced settings
                  </p>
                </div>
                <div className="bg-background/50 backdrop-blur-sm p-6 rounded-lg border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure</h3>
                  <p className="text-muted-foreground">
                    Your data is protected with our advanced security measures
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trending Now Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
            <MovieCarousel />
          </section>

          {/* Popular Movies Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
            <MovieGrid />
          </section>
        </div>
      </main>
    </div>
  )
}

