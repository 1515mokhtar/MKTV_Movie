"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  ChevronLeft,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Clock,
  SkipForward,
  SkipBack,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { useComments } from "@/hooks/use-comments"
import { useSimilarMovies } from "@/hooks/use-similar-movies"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

interface MovieData {
  id: string
  name: string
  urlmovie: string
  movieId?: string
  description?: string
  year?: number
  genres?: string[]
  rating?: number
  thumbnail?: string
  createdAt?: string
  duration?: string
}

interface RelatedMovie {
  id: string
  name: string
  thumbnail: string
  year?: number
  duration?: string
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  avatar: string;
}

// Mock related movies
const mockRelatedMovies: RelatedMovie[] = [
  {
    id: "movie1",
    name: "Inception",
    thumbnail: "/placeholder.svg?height=180&width=320",
    year: 2010,
    duration: "2h 28m",
  },
  {
    id: "movie2",
    name: "The Dark Knight",
    thumbnail: "/placeholder.svg?height=180&width=320",
    year: 2008,
    duration: "2h 32m",
  },
  {
    id: "movie3",
    name: "Interstellar",
    thumbnail: "/placeholder.svg?height=180&width=320",
    year: 2014,
    duration: "2h 49m",
  },
  { id: "movie4", name: "Dune", thumbnail: "/placeholder.svg?height=180&width=320", year: 2021, duration: "2h 35m" },
]

// Mock comments
const mockComments: Comment[] = [
  {
    id: "1",
    author: "John Doe",
    content: "Great movie! The cinematography was amazing.",
    timestamp: new Date(),
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: "2",
    author: "Jane Smith",
    content: "I loved the plot twist in the middle. Didn't see that coming!",
    timestamp: new Date(),
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: "3",
    author: "Mike Johnson",
    content: "The soundtrack was perfect for this film.",
    timestamp: new Date(),
    avatar: "https://i.pravatar.cc/150?img=3"
  }
]

function SimilarMoviesSection({ similarMovies, loading, error }: { similarMovies: any[], loading: boolean, error: string | null }) {
  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading similar movies: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!similarMovies || similarMovies.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        No similar movies found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {similarMovies.map((movie) => (
        <div key={movie.id} className="group">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg mb-2">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
          <p className="text-gray-400 text-xs">
            {movie.release_date?.split("-")[0]}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function WatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [movie, setMovie] = useState<MovieData | null>(null)
  const { comments, loading: commentsLoading, addComment, likeComment, dislikeComment } = useComments(params.id as string)
  const [tmdbId, setTmdbId] = useState<string>("")
  const { similarMovies, loading: similarLoading, error: similarError } = useSimilarMovies(tmdbId)

  console.log("TMDB ID:", tmdbId)
  console.log("Similar movies:", similarMovies)

  const [relatedMovies, setRelatedMovies] = useState<RelatedMovie[]>(mockRelatedMovies)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Video player state
  const [isTheaterMode, setIsTheaterMode] = useState(false)

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const fetchMovie = async () => {
    if (!params.id) return

    try {
      const movieRef = doc(db, "movies", params.id as string)
      const movieDoc = await getDoc(movieRef)

      if (movieDoc.exists()) {
        const movieData = movieDoc.data() as MovieData
        setMovie(movieData)
        
        // Vérifier si nous avons déjà un movieId (tmdbId)
        if (movieData.movieId) {
          setTmdbId(movieData.movieId)
          console.log("Using existing movieId:", movieData.movieId)
        } else if (movieData.name) {
          // Si nous n'avons pas de movieId mais que nous avons un nom, chercher le tmdbId
          console.log("Fetching tmdbId for movie:", movieData.name)
          await fetchTmdbId(movieData.name)
        }
      } else {
        // Créer un nouveau document si le film n'existe pas
        const newMovieData: MovieData = {
          id: params.id as string,
          name: searchParams.get("name") || "",
          urlmovie: searchParams.get("urlmovie") || "",
          movieId: searchParams.get("movieId") || "",
        }
        
        await setDoc(movieRef, newMovieData)
        setMovie(newMovieData)
        
        if (newMovieData.movieId) {
          setTmdbId(newMovieData.movieId)
          console.log("Using provided movieId:", newMovieData.movieId)
        } else if (newMovieData.name) {
          console.log("Fetching tmdbId for new movie:", newMovieData.name)
          await fetchTmdbId(newMovieData.name)
        }
      }
    } catch (error) {
      console.error("Error fetching movie:", error)
      setError("Failed to load movie data")
    } finally {
      setLoading(false)
    }
  }

  const fetchTmdbId = async (movieName: string) => {
    try {
      console.log("Searching TMDB for movie:", movieName)
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to search TMDB: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("TMDB search results:", data)

      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0]
        const tmdbId = firstResult.id.toString()
        setTmdbId(tmdbId)
        console.log("Found TMDB ID:", tmdbId)

        // Mettre à jour le document dans Firestore avec les informations TMDB
        if (params.id) {
          const movieRef = doc(db, "movies", params.id)
          const updatedMovie = {
            movieId: tmdbId,
            description: firstResult.overview,
            year: firstResult.release_date?.split("-")[0],
            genres: firstResult.genre_ids,
            rating: firstResult.vote_average,
            thumbnail: `https://image.tmdb.org/t/p/w500${firstResult.poster_path}`,
          }
          await updateDoc(movieRef, updatedMovie)
          console.log("Updated movie with TMDB data")
        }
      } else {
        console.log("No TMDB results found for:", movieName)
      }
    } catch (error) {
      console.error("Error fetching TMDB ID:", error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchMovie()
    }
  }, [params.id])

  // Log when similarMovies changes
  useEffect(() => {
    console.log("Similar movies state changed:", {
      loading: similarLoading,
      movies: similarMovies,
      tmdbId
    })
  }, [similarMovies, similarLoading, tmdbId])

  const addToWatchlist = () => {
    toast({
      title: "Ajouté à votre liste",
      description: `${movie?.name} a été ajouté à votre liste de visionnage.`,
    })
  }

  const shareMovie = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Lien copié",
      description: "Le lien du film a été copié dans votre presse-papiers.",
    })
  }

  const handleAddComment = (content: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour commenter",
        variant: "destructive"
      })
      return
    }
    addComment(content)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-gray-400">Chargement de votre film...</p>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full text-center">
          <X className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4">Film non disponible</h1>
          <p className="text-gray-400 mb-6">
            {error || "Ce film n'est pas disponible actuellement. Veuillez réessayer plus tard."}
          </p>
          <Button asChild>
            <Link href="/movies">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-black text-white", isTheaterMode ? "pb-0" : "pb-12")}>
      {/* Back button and title - only visible on non-theater mode */}
      {!isTheaterMode && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/browse">
                <ChevronLeft className="h-6 w-6" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold truncate">{movie.name}</h1>
          </div>
        </div>
      )}

      {/* Video player section */}
      <div className={cn("relative w-full bg-black", isTheaterMode ? "h-screen" : "aspect-video max-h-[80vh]")}>
        {/* Video element */}
        <iframe
          src={movie?.urlmovie}
          className="w-full h-full rounded-xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />

        {/* Simple controls */}
        <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white"
            onClick={toggleTheaterMode}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
        </div>
      </div>

      {/* Content below video - only visible in non-theater mode */}
      {!isTheaterMode && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie details and tabs */}
            <div className="lg:col-span-2">
              {/* Movie info */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{movie.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.duration && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                        <span>{movie.duration}</span>
                      </>
                    )}
                    {movie.rating && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                        <span className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          {movie.rating}/10
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={addToWatchlist}>
                    <Bookmark className="h-4 w-4" />
                    <span>Watchlist</span>
                  </Button>

                  <Button variant="outline" size="sm" className="gap-2" onClick={shareMovie}>
                    <Share2 className="h-4 w-4" />
                    <span>Partager</span>
                  </Button>
                </div>
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-800 hover:bg-gray-700">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              {movie.description && <p className="text-gray-300 mb-8 leading-relaxed">{movie.description}</p>}

              {/* Tabs for comments and more */}
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-6">
                  <TabsTrigger value="comments">Commentaires</TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="space-y-6">
                  {/* Comment form */}
                  {user ? (
                  <div className="flex gap-3">
                    <Avatar>
                        <AvatarImage src={user.photoURL || "/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ajouter un commentaire..."
                        rows={2}
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const textarea = document.querySelector("textarea")
                            if (textarea && textarea.value.trim()) {
                                handleAddComment(textarea.value)
                              textarea.value = ""
                            }
                          }}
                        >
                          Commenter
                        </Button>
                      </div>
                    </div>
                  </div>
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <p className="text-gray-400 mb-2">Connectez-vous pour commenter</p>
                      <Button asChild>
                        <Link href="/login">Se connecter</Link>
                      </Button>
                    </div>
                  )}

                  {/* Comments list */}
                  <div className="space-y-6">
                    {commentsLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-gray-800/50 p-4 rounded-lg">
                        <Avatar>
                            <AvatarImage src={comment.userPhoto || "/placeholder.svg"} />
                            <AvatarFallback>{comment.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{comment.username}</span>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: fr })}
                              </span>
                          </div>
                            <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                              <button 
                                className="flex items-center gap-1 hover:text-gray-300"
                                onClick={() => likeComment(comment.id)}
                                title="J'aime"
                              >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>{comment.likes}</span>
                            </button>
                              <button 
                                className="flex items-center gap-1 hover:text-gray-300"
                                onClick={() => dislikeComment(comment.id)}
                                title="Je n'aime pas"
                              >
                              <ThumbsDown className="h-3.5 w-3.5" />
                                <span>{comment.dislikes}</span>
                            </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar with related content */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Films similaires</h2>
              <SimilarMoviesSection 
                similarMovies={similarMovies} 
                loading={similarLoading} 
                error={similarError}
              />

              {/* Watch history */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Historique de visionnage</h2>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium">Continuer à regarder</h3>
                  </div>
                  <div className="space-y-3">
                    {mockRelatedMovies.slice(0, 2).map((movie, index) => (
                      <Link
                        key={`history-${movie.id}`}
                        href={`/watch/${movie.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative w-16 h-9 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={movie.thumbnail || "/placeholder.svg"}
                            alt={movie.name}
                            fill
                            className="object-cover"
                          />
                          {/* Progress bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                            <div className="h-full bg-primary" style={{ width: `${index === 0 ? 75 : 45}%` }}></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {movie.name}
                          </h4>
                          <p className="text-xs text-gray-400">{index === 0 ? "Il y a 2 heures" : "Hier"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
