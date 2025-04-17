"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
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

interface MovieData {
  name: string
  urlmovie: string
  description?: string
  year?: number
  duration?: string
  genres?: string[]
  rating?: number
  thumbnail?: string
}

interface RelatedMovie {
  id: string
  name: string
  thumbnail: string
  year?: number
  duration?: string
}

interface ServerOption {
  id: number
  name: string
  quality: string
  isPremium?: boolean
}

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
  }
  text: string
  timestamp: string
  likes: number
}

// Enhanced server options
const serverOptions: ServerOption[] = [
  { id: 1, name: "Serveur Rapide", quality: "HD 720p" },
  { id: 2, name: "Serveur Premium", quality: "Full HD 1080p", isPremium: true },
  { id: 3, name: "Serveur Ultra", quality: "4K HDR", isPremium: true },
  { id: 4, name: "Serveur Léger", quality: "SD 480p" },
]

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
    id: "c1",
    user: { name: "Alex", avatar: "/placeholder.svg?height=40&width=40" },
    text: "Ce film est incroyable, les effets spéciaux sont à couper le souffle !",
    timestamp: "2 heures",
    likes: 24,
  },
  {
    id: "c2",
    user: { name: "Sophie", avatar: "/placeholder.svg?height=40&width=40" },
    text: "J'ai adoré l'intrigue et les rebondissements. À voir absolument !",
    timestamp: "5 heures",
    likes: 18,
  },
  {
    id: "c3",
    user: { name: "Thomas", avatar: "/placeholder.svg?height=40&width=40" },
    text: "La bande sonore est exceptionnelle, elle accompagne parfaitement les scènes d'action.",
    timestamp: "1 jour",
    likes: 42,
  },
]

export default function WatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const serverId = searchParams.get("server") || "1"
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { comments, loading: commentsLoading, addComment, likeComment, dislikeComment } = useComments(params.id as string)
  const { similarMovies, loading: similarLoading } = useSimilarMovies(params.id as string)

  const [movie, setMovie] = useState<MovieData | null>(null)
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

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const docRef = doc(db, "movies", params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const movieData = docSnap.data() as MovieData
          setMovie(movieData)
        } else {
          setError("Film non trouvé dans la base de données")
        }
      } catch (err) {
        console.error("Error fetching movie:", err)
        setError("Erreur lors de la récupération du film: " + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [params.id])

  const changeServer = (server: ServerOption) => {
    if (server.isPremium) {
      toast({
        title: "Accès Premium requis",
        description: "Cette qualité est réservée aux membres premium. Mettez à niveau votre compte pour y accéder.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would change the video source here
  }

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
            <Link href="/browse">Retour à l'accueil</Link>
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="comments">Commentaires</TabsTrigger>
                  <TabsTrigger value="servers">Serveurs</TabsTrigger>
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

                <TabsContent value="servers">
                  <div className="grid gap-4">
                    {serverOptions.map((server) => (
                      <button
                        key={server.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg transition-colors text-left",
                          server.id === 1 ? "bg-primary/20 border border-primary/30"
                            : "bg-gray-800 hover:bg-gray-700 border border-transparent",
                        )}
                        onClick={() => changeServer(server)}
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {server.name}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{server.quality}</div>
                        </div>
                        {server.isPremium && (
                          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                            Premium
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar with related content */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Films similaires</h2>
              <div className="space-y-4">
                {similarLoading ? (
                  <div className="col-span-full flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  similarMovies.map((movie) => (
                    <Link key={movie.id} href={`/watch/${movie.id}`} className="group block">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Play className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                          {movie.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

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
