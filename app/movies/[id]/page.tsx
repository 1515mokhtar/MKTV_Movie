"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, Star, ChevronLeft, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import VideoPlayer from "@/components/VideoPlayer"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { toast } from "react-hot-toast"
import Loader2 from "@/components/icons/Loader2"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { MovieCard } from "@/components/movie-card"

async function getMovieDetails(id: string) {
  const url = `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits,similar,videos&language=en-US`

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    },
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!res.ok) {
    const errorData = await res.json() // Get response data for debugging
    console.error("Error fetching movie details:", errorData)
    notFound() // Can show an error page instead of a generic 'not found'
  }

  return res.json()
}

function MovieInfo({ movie }: { movie: any }) {
  const router = useRouter()
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [user, loading] = useAuthState(auth)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false)
  const [processing, setProcessing] = useState(false) // État pour gérer le chargement

  const handleLoginRedirect = () => {
    router.push("/login") // Rediriger l'utilisateur vers la page de login
  }

  useEffect(() => {
    if (!user || loading) return

    const checkWatchlist = async () => {
      try {
        const docRef = doc(db, "watchlist", `${user.uid}_${movie.id}`)
        const docSnap = await getDoc(docRef)
        setIsInWatchlist(docSnap.exists())
      } catch (error) {
        console.error("Error checking watchlist:", error)
        toast.error("Failed to check watchlist status")
      }
    }

    checkWatchlist()
  }, [user, movie.id, loading])

  const handleWatchNow = () => {
    router.push(`/watch/${movie.id}`);
  }

  const handleWatchlist = async () => {
    if (processing) return // Empêcher les clics multiples

    if (!user) {
      setIsLoginPopupOpen(true) // Afficher la popup de connexion
      return
    }

    setProcessing(true)

    try {
      const docRef = doc(db, "watchlist", `${user.uid}_${movie.id}`)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        await deleteDoc(docRef)
        setIsInWatchlist(false)
        toast.success("Removed from watchlist")
      } else {
        await setDoc(docRef, {
          userId: user.uid,
          movieId: movie.id,
          title: movie.title,
          rater:movie.vote_average.toFixed(1),
          releaseDate: movie.release_date,
          genre: movie.genres.map((genre: any) => ({ id: genre.id, name: genre.name })),
          posterPath: movie.poster_path,
          addedAt: new Date(),
        })
        setIsInWatchlist(true)
        toast.success("Added to watchlist")
      }
    } catch (error) {
      console.error("Watchlist error:", error)
      toast.error("Operation failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  // Fermer la popup de connexion si l'utilisateur se connecte
  useEffect(() => {
    if (user) {
      setIsLoginPopupOpen(false)
    }
  }, [user])

  return (
    <>
      <div className="grid gap-8 md:grid-cols-[1fr,2fr] lg:grid-cols-[2fr,3fr] lg:gap-12">
        <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto md:mx-0">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover rounded-lg shadow-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{movie.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm md:text-base">
            {movie.genres.map((genre: any) => (
              <Badge key={genre.id} variant="secondary" className="px-3 py-1 text-sm md:text-base">
                {genre.name}
              </Badge>
            ))}
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{movie.overview}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold">{movie.vote_average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">Rating</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-semibold">{new Date(movie.release_date).getFullYear()}</span>
              <span className="text-sm text-muted-foreground">Year</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
              <Clock className="w-6 h-6 text-green-500" />
              <span className="text-lg font-semibold">{movie.runtime}</span>
              <span className="text-sm text-muted-foreground">Minutes</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">{movie.popularity.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground">Popularity</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg shadow-md transition-all text-sm md:text-base">
                  Watch Trailer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] bg-cover bg-center" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}>
                <VisuallyHidden>
                  <DialogTitle>Trailer</DialogTitle>
                </VisuallyHidden>
                <div className="aspect-video">
                  {movie.videos && movie.videos.results && movie.videos.results.length > 0 ? (
                    <VideoPlayer url={`https://www.youtube.com/watch?v=${movie.videos.results[0].key}`} />
                  ) : (
                    <p>No trailer available</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button className="text-sm md:text-base" onClick={handleWatchNow}>
              Watch Now
            </Button>
            <Button className="text-sm md:text-base" variant="outline" onClick={handleWatchlist} disabled={processing}>
              {processing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : isInWatchlist ? (
                "Remove from Watchlist"
              ) : (
                "Add to Watchlist"
              )}
            </Button>
            <Dialog open={isLoginPopupOpen} onOpenChange={setIsLoginPopupOpen}>
              <DialogContent>
                <p className="text-lg">You must be logged in to add movies to your watchlist.</p>
                <Button onClick={handleLoginRedirect} className="mt-4">
                  Login
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}

function CastSection({ cast }: { cast: any[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {cast.slice(0, 6).map((actor) => (
          <Card key={actor.id} className="overflow-hidden">
            <div className="relative aspect-[2/3]">
              <Image
                src={
                  actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/placeholder-actor.png"
                }
                alt={actor.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              />
            </div>
            <CardContent className="p-4">
              <p className="font-semibold truncate">{actor.name}</p>
              <p className="text-sm text-muted-foreground truncate">{actor.character}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function SimilarMoviesSection({ similarMovies }: { similarMovies: any[] }) {
  return (
    <section className="m-0 box-border">
      <h2 className="text-3xl font-bold mb-6">Similar Movies</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="relative"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {similarMovies.slice(0, 12).map((movie) => (
            <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <Link href={`/movies/${movie.id}`}>
                <Card className="overflow-hidden">
                  <div className="relative w-full h-full aspect-[2/3]">
                    <Image
                      src={movie?.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : "/placeholder.png"}
                      alt={movie?.title || "Movie Poster"}
                      width={200}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold truncate">{movie.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{new Date(movie.release_date).getFullYear()}</p>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </section>
  );
}

function MoviePage({ movie }: { movie: any }) {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-800">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <MovieInfo movie={movie} />
      <CastSection cast={movie.credits.cast} />
      <SimilarMoviesSection similarMovies={movie.similar.results} />
    </div>
  )
}

function MovieInfoSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[2fr,3fr] lg:gap-12">
      <Skeleton className="aspect-[2/3] w-full max-w-md mx-auto md:mx-0" />
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  )
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </section>
  )
}

export default async function MoviePageWrapper({ params }: { params: { id: string } }) {
  let movie
  try {
    movie = await getMovieDetails(params.id)
  } catch (error) {
    console.error("Error fetching movie details:", error)
    notFound()
  }

  return (
    <Suspense fallback={<MovieInfoSkeleton />}>
      <MoviePage movie={movie} />
    </Suspense>
  )
}

