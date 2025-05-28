"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
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
  Check,
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
import { useWatchHistory } from "@/hooks/use-watch-history"
import { WatchHistoryList } from '@/components/watch-history-list'
import { EnhancedMovieCard } from "@/components/EnhancedMovieCard"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { toast } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  title: string
  timeline: string
  posterPath?: string
  backdropPath?: string
  posterSizes?: {
    small: string
    medium: string
    large: string
    original: string
  }
  backdropSizes?: {
    small: string
    medium: string
    large: string
    original: string
  }
  similarMovies?: any[]
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
  const [user] = useAuthState(auth)

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading similar movies: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-none w-full animate-pulse">
            <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!similarMovies || similarMovies.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        Aucun film similaire trouvé
      </div>
    )
  }

  return (
    <Carousel>
      <CarouselContent className="-ml-4">
        {similarMovies.map((movie) => (
          <CarouselItem key={movie.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5">
            <Link href={`/movies/${movie.id}`}>
              <EnhancedMovieCard
                movie={{
                  id: movie.id.toString(),
                  title: movie.title,
                  posterPath: movie.poster_path,
                  releaseDate: movie.release_date,
                  rating: movie.vote_average
                }}
                isWatchlist={false}
                showYear={false}
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default function WatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const router = useRouter()
  const [movie, setMovie] = useState<MovieData | null>(null)
  const { comments, loading: commentsLoading, addComment, likeComment, dislikeComment } = useComments(params.id as string)
  const [tmdbId, setTmdbId] = useState<string>("")
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
  const [similarLoading, setSimilarLoading] = useState(true)
  const [similarError, setSimilarError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false)

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger la vidéo. Veuillez réessayer plus tard.",
      variant: "destructive",
    })
  }

  const [relatedMovies, setRelatedMovies] = useState<RelatedMovie[]>(mockRelatedMovies)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize watch history hook
  const { loadProgress, saveProgress, startAutoSave, isLoading: historyLoading } = useWatchHistory({
    videoId: params.id as string,
    onProgressLoad: (progress) => {
      if (iframeRef.current && progress.currentTime > 0) {
        // NOTE: It's not possible to set currentTime directly on an iframe.
        // If the embedded player supports seeking via postMessage, you would send a message here.
        console.log("Loaded progress from history:", progress.currentTime); // Log loaded time
        // Example: iframeRef.current.contentWindow?.postMessage({ type: 'seek', time: progress.currentTime }, '*');
      }
    }
  });

  // Fonction pour obtenir les détails du film de TMDB
  const fetchMovieDetails = async (identifier: string): Promise<any | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Ou KEY, selon votre env.
      if (!apiKey) {
        console.error('TMDB API key is not configured');
        return null;
      }

      let data = null;
      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`, // Utilisation de l'authentification par Bearer Token
      };

      // Tenter de chercher par ID d'abord
      if (identifier) {
        try {
          // Ajout de append_to_response pour inclure les films similaires et autres données utiles
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${identifier}?append_to_response=similar,credits,videos&language=fr-FR`,
            { headers, next: { revalidate: 60 * 60 * 24 } } // Ajouter revalidate comme dans l'autre fichier
          );
          if (response.ok) {
            data = await response.json();
            console.log("TMDB Movie Data by ID (with similar):", data); // Pour le débogage
            if (data?.id) return data; // Retourner si les données par ID sont valides
          }
        } catch (error) {
           console.warn(`Failed to fetch TMDB by ID ${identifier}:`, error);
        }
      }

      // Si la recherche par ID a échoué ou n'a pas retourné de données valides, essayer par titre
      // NOTE: La recherche par titre ne permet pas d'appender les relations (similar, etc.)
      // Nous allons donc retourner les données de base trouvées par titre si l'ID échoue complètement.
      if (!data && movie?.name) {
        console.log("TMDB search by title as fallback:", movie.name);
        try {
          const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movie.name)}&language=fr-FR`,
             { headers } // Utiliser l'authentification par Bearer Token ici aussi
          );
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.results && searchData.results.length > 0) {
              const firstResult = searchData.results[0];
              console.log("TMDB Search Result (fallback):", firstResult); // Pour le débogage
              // Retourner les données de base de la recherche par titre comme dernier recours
              return firstResult; 
            }
          }
        } catch (error) {
           console.warn(`Failed to search TMDB by title ${movie.name}:`, error);
        }
      }

      console.warn("Could not retrieve valid TMDB data for identifier:", identifier, "and movie name:", movie?.name); // Pour le débogage
      return null; // Retourner null si aucune donnée valide n'a pu être trouvée
    } catch (error) {
      console.error("Unexpected error in fetchMovieDetails:", error);
      return null;
    }
  };

  // Fonction utilitaire pour obtenir le nom du genre à partir de son ID (si TMDB data is used)
  // (Keep this function as TMDB returns genre IDs)
  const getGenreNameFromId = (genreId: number): string => {
    const genres: { [key: number]: string } = {
      28: "Action", 12: "Aventure", 16: "Animation", 35: "Comédie", 80: "Crime",
      99: "Documentaire", 18: "Drame", 10751: "Famille", 14: "Fantastique", 36: "Histoire",
      27: "Horreur", 10402: "Musique", 9648: "Mystère", 10749: "Romance", 878: "Science-Fiction",
      10770: "Téléfilm", 53: "Thriller", 10752: "Guerre", 37: "Western",
    };
    return genres[genreId] || "Autre";
  };

  const handleWatchlist = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter à votre watchlist",
        variant: "destructive"
      })
      return
    }

    if (!movie) {
      toast({
        title: "Erreur",
        description: "Les données du film sont incomplètes",
        variant: "destructive"
      })
      return
    }

    try {
      setIsWatchlistLoading(true)
      const watchlistRef = doc(db, "watchlist", `${user.uid}_${movie.id}`)
      const watchlistDoc = await getDoc(watchlistRef)
      const exists = watchlistDoc.exists()

      if (exists) {
        setShowRemoveConfirm(true)
      } else {
        // Récupérer les détails complets du film depuis TMDB en utilisant l'ID ou le nom
        // Utilise movie.movieId comme identifiant principal s'il existe, sinon utilise movie.id (qui est l'ID Firestore)
        const tmdbData = await fetchMovieDetails(movie.movieId || movie.id)

        // Préparation des données du film pour la watchlist
        const watchlistData = {
          // Données de base (priorité aux données TMDB si disponibles)
          userId: user.uid,
          movieId: tmdbData?.id?.toString() || movie.movieId || movie.id,
          title: tmdbData?.title || movie.name || "Film sans titre", // Fallback pour le titre
          releaseDate: tmdbData?.release_date || movie.year?.toString() || "",
          rater: tmdbData?.vote_average?.toString() || movie.rating?.toString() || "0",
          posterPath: tmdbData?.poster_path || movie.posterPath || "", // Priorité à TMDB poster_path
          
          // Genres au format correct depuis TMDB ou données locales
          genre: tmdbData?.genres?.map((genre: { id: number; name: string }) => ({
            id: genre.id,
            name: genre.name
          })) || (Array.isArray(movie.genres) ? movie.genres.map((genre, index) => ({
            id: index + 1,
            name: genre
          })) : []), // Fallback pour les genres
          
          // Données supplémentaires (priorité aux données TMDB si disponibles)
          addedAt: new Date().toISOString(),
          urlmovie: movie.urlmovie || "",
          description: tmdbData?.overview || movie.description || "",
          duration: movie.duration || "",
          tmdbId: tmdbData?.id?.toString() || movie.movieId || "", // S'assurer que tmdbId est le TMDB ID
          type: "movie",
          source: "mktv",
          status: "active"
        }

        console.log("Watchlist Data to save:", watchlistData) // Pour le débogage

        // Nettoyage des données (inchangé)
        const cleanedData = Object.entries(watchlistData).reduce((acc, [key, value]) => {
          if (value === undefined) {
            if (typeof value === 'string') acc[key] = '';
            else if (Array.isArray(value)) acc[key] = [];
            else if (typeof value === 'number') acc[key] = 0;
            else acc[key] = null;
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        // Sauvegarde dans Firebase
        await setDoc(watchlistRef, cleanedData)
        
        // Mise à jour de l'état local
        setIsInWatchlist(true)
        
        // Notification de succès
        toast({
          title: "Film ajouté",
          description: "Le film a été ajouté à votre watchlist",
        })
      }
    } catch (error) {
      console.error("Error in watchlist operation:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de la mise à jour de votre watchlist",
        variant: "destructive"
      })
    } finally {
      setIsWatchlistLoading(false)
    }
  }

  const handleRemoveFromWatchlist = async () => {
    if (!user || !movie) return;

    try {
      setIsWatchlistLoading(true)
      const watchlistRef = doc(db, "watchlist", `${user.uid}_${movie.id}`)
      await deleteDoc(watchlistRef)
      setIsInWatchlist(false)
      setShowRemoveConfirm(false)
      toast({
        title: "Film retiré",
        description: "Le film a été retiré de votre watchlist",
      })
    } catch (error) {
      console.error("Error removing from watchlist:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du film",
        variant: "destructive"
      })
    } finally {
      setIsWatchlistLoading(false)
    }
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

  // Handle messages from iframe (assuming player sends time updates)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine du message pour la sécurité
      // IMPORTANT: Remplacez 'uqload.net' par l'origine réelle de votre iframe si elle est différente
      // ou ajoutez une vérification plus robuste si nécessaire.
      // if (!event.origin.includes('uqload.net')) return; // Example origin check

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Exemple basé sur les messages potentiels d'un lecteur embarqué
        if (data.type === 'timeupdate') {
          // Si le lecteur envoie currentTime et duration
          if (data.currentTime !== undefined && data.duration !== undefined && data.duration > 0) {
             // Calculer la progression et sauvegarder avec le hook
            const progress = (data.currentTime / data.duration) * 100;
            saveProgress(progress, data.duration); // Correction: Passer aussi la durée
          } else if (data.progress !== undefined) {
             // Si le lecteur envoie directement le pourcentage de progression, on le sauvegarde (sans durée ici)
             // NOTE: Le hook saveProgress pourrait nécessiter la durée même avec le pourcentage. À vérifier.
             // Pour l'instant, on passe juste le pourcentage si la durée n'est pas dispo.
             saveProgress(data.progress, 0); // On passe 0 pour la durée si non dispo, ou adapter le hook
          }
        } else if (data.type === 'playback') {
          // Gérer l'état de lecture si le lecteur l'envoie
          // setIsPlaying(data.isPlaying);
        }
        // Ajouter d'autres types de messages si votre lecteur iframe en envoie (volume, fullscreen, etc.)

      } catch (error) {
        // console.error('Error processing message from iframe:', error); // Uncomment for debugging
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, movie, saveProgress]); // saveProgress est la fonction du hook

  const fetchMovie = async () => {
    if (!params.id) return;

    try {
      console.log('Fetching movie data for ID:', params.id);
      const movieRef = doc(db, "movies", params.id as string);
      const movieDoc = await getDoc(movieRef);

      if (movieDoc.exists()) {
        const movieData = movieDoc.data() as MovieData;
        movieData.id = params.id as string;
        console.log('Movie data loaded from Firestore:', movieData); // Log 1
        
        // Tenter de récupérer les détails complets (y compris similar) depuis TMDB
        const tmdbData = await fetchMovieDetails(movieData.movieId || movieData.id); // Utiliser TMDB ID ou Firestore ID comme identifiant
        
        if (tmdbData) {
           // Mettre à jour l'objet movieData avec les données TMDB et Firestore
           // Prioriser les données TMDB si disponibles
          const updatedMovieData = {
            ...movieData, // Conserver les données Firestore existantes (urlmovie, etc.)
            name: tmdbData.title || movieData.name || "", // Priorité au titre TMDB
            title: tmdbData.title || movieData.name || "", // S'assurer que title est aussi mis à jour pour l'affichage
            movieId: tmdbData.id?.toString() || movieData.movieId || movieData.id, // Utiliser l'ID TMDB comme ID principal
            description: tmdbData.overview || movieData.description || "",
            year: tmdbData.release_date ? parseInt(tmdbData.release_date.split("-")[0]) : movieData.year, // Année depuis TMDB
            genres: tmdbData.genres?.map((genre: { id: number; name: string }) => genre.name) || movieData.genres || [], // Noms de genres depuis TMDB
            rating: tmdbData.vote_average || movieData.rating || 0, // Note depuis TMDB
            posterPath: tmdbData.poster_path || movieData.posterPath || "", // PosterPath depuis TMDB
            backdropPath: tmdbData.backdrop_path || movieData.backdropPath || "", // BackdropPath depuis TMDB
            // Les tailles d'images pourraient aussi être mises à jour ici si TMDB les fournit directement
            // ou calculées à partir des poster/backdrop paths
            similarMovies: tmdbData.similar?.results || [], // Récupérer les films similaires
            runtime: tmdbData.runtime || undefined, // Durée depuis TMDB si disponible
            // Ajouter d'autres champs TMDB si nécessaire (credits, videos, etc.)
          };
          console.log('Movie data updated with TMDB:', updatedMovieData); // Log pour débogage
          setMovie(updatedMovieData);
          // Mettre à jour tmdbId pour fetchSimilarMovies section (même si on la supprime, utile pour d'autres logiques dépendant de l'id TMDB)
          setTmdbId(updatedMovieData.movieId || movieData.movieId || movieData.id);

        } else {
          // Si la récupération TMDB échoue, utiliser les données Firestore telles quelles
          console.warn('Failed to fetch TMDB data, using Firestore data only:', movieData);
          setMovie(movieData);
           setTmdbId(movieData.movieId || movieData.id);
        }
        
      } else {
        console.log('Movie not found in database');
        setError("Film non disponible");
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      setError("Une erreur est survenue lors du chargement du film");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchMovie()
    }
  }, [params.id])

  // Log when similarMovies changes - Keep this if you still use the state/variable
  useEffect(() => {
    console.log("Similar movies state changed:", {
      // We will now get similar movies directly in the movie object, not a separate state
      // You might need to update how SimilarMoviesSection receives data
      // loading: similarLoading, // This state is now less relevant for similar movies alone
      // movies: similarMovies, // This state might be removed
      tmdbId: tmdbId, // Keep this if tmdbId is used elsewhere
      movieSimilar: movie?.similarMovies // Log similar movies from the main movie object
    });
  }, [movie, tmdbId]); // Depend on movie object and tmdbId

  // Vérifier si le film est dans la watchlist au chargement
  useEffect(() => {
    console.log("Current movie state:", movie); // Log 2
    const checkWatchlistStatus = async () => {
      if (!user || !movie) {
        console.log("Check watchlist status: User or movie not available", { user, movieId: movie?.id })
        return
      }
      
      try {
        console.log("Checking watchlist status for:", {
          userId: user.uid,
          movieId: movie.id,
          movieTitle: movie.name
        })

        const watchlistRef = doc(db, "watchlist", `${user.uid}_${movie.id}`)
        const watchlistDoc = await getDoc(watchlistRef)
        const exists = watchlistDoc.exists()
        
        console.log("Watchlist status:", {
          exists,
          data: exists ? watchlistDoc.data() : null
        })

        setIsInWatchlist(exists)
      } catch (error) {
        console.error("Error checking watchlist status:", error)
      }
    }

    checkWatchlistStatus()
  }, [user, movie])

  // Add this function to handle the video URL
  const getVideoUrl = (url: string | undefined) => {
    if (!url) return '';
    
    // If the URL is already a full URL, return it
    if (url.startsWith('http')) return url;
    
    // If it's a relative URL, format it for uqload.net
    // Remove any leading slashes and ensure proper format
    const cleanUrl = url.replace(/^\/+/, '');
    return `https://uqload.net/embed-${cleanUrl}.html`;
  }

  // Add console log to debug the URL
  useEffect(() => {
    if (movie?.urlmovie) {
      console.log('Original URL:', movie.urlmovie);
      console.log('Formatted URL:', getVideoUrl(movie.urlmovie));
    }
  }, [movie?.urlmovie]);

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
          <h1 className="text-2xl font-bold mb-4">Film indisponible</h1>
          <p className="text-gray-400 mb-6">
            Ce film n'est pas disponible actuellement. Veuillez réessayer plus tard ou choisir un autre film.
          </p>
          <div className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/movies">Retour à l'accueil</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/movies/disponible">Voir les films disponibles</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button and title */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="hover:bg-gray-800"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold truncate">{movie?.title}</h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full bg-black">
        <div className="container mx-auto px-4">
          <div className="relative w-full max-w-[1280px] mx-auto aspect-video rounded-lg overflow-hidden h-[720px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={getVideoUrl(movie?.urlmovie)}
              className={cn(
                "w-full h-full",
                isLoading ? "opacity-0" : "opacity-100",
                "transition-opacity duration-300"
              )}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Watchlist and Share buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "gap-2",
                  isInWatchlist ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-gray-800",
                  isWatchlistLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleWatchlist}
                disabled={isWatchlistLoading || !user}
              >
                {isWatchlistLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isInWatchlist ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span>
                  {isWatchlistLoading 
                    ? "Chargement..." 
                    : isInWatchlist 
                      ? "Dans la watchlist" 
                      : user 
                        ? "Ajouter à la watchlist" 
                        : "Connectez-vous pour ajouter"}
                </span>
              </Button>

              <Button variant="outline" size="sm" className="gap-2" onClick={shareMovie}>
                <Share2 className="h-4 w-4" />
                <span>Partager</span>
              </Button>
            </div>

            {/* Genres */}
            {movie?.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-800 hover:bg-gray-700">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            {movie?.description && (
              <p className="text-gray-300 mb-8 leading-relaxed">{movie.description}</p>
            )}

            {/* Comments section */}
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Films similaires</h2>
            <SimilarMoviesSection 
              similarMovies={movie?.similarMovies || []}
              loading={loading}
              error={error}
            />

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Historique de visionnage</h2>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium">Continuer à regarder</h3>
                </div>
                <WatchHistoryList />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer de la watchlist</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer "{movie?.name}" de votre watchlist ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromWatchlist}
              className="bg-red-600 hover:bg-red-700"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Helper function to format time - Might not be needed with iframe
/*
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
*/

