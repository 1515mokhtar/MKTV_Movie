"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow, isValid } from "date-fns"
import { fr } from "date-fns/locale"

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

interface WatchlistItem {
  id: string
  userId: string
  movieId: string
  title: string
  posterPath: string
  addedAt: string
  releaseDate: string
  rating: number
  genres: string[]
  description: string
  duration: string
  urlmovie: string
}

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string) => {
      try {
    const date = new Date(dateString)
    if (!isValid(date)) {
      return "Date inconnue"
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: fr })
      } catch (error) {
    console.error("Error formatting date:", error)
    return "Date inconnue"
  }
}

// Fonction utilitaire pour valider et convertir la date
const validateAndConvertDate = (dateString: any): string => {
  try {
    if (!dateString) {
      return new Date().toISOString()
    }

    if (dateString instanceof Date && isValid(dateString)) {
      return dateString.toISOString()
    }

    if (typeof dateString === 'string') {
      const date = new Date(dateString)
      if (isValid(date)) {
        return date.toISOString()
      }
    }

    if (dateString && typeof dateString.toDate === 'function') {
      const date = dateString.toDate()
      if (isValid(date)) {
        return date.toISOString()
      }
    }

    return new Date().toISOString()
  } catch (error) {
    console.error("Error converting date:", error)
    return new Date().toISOString()
      }
    }

// Fonction utilitaire pour obtenir l'URL de l'image TMDB
const getTMDBImageUrl = (posterPath: string): string => {
  if (!posterPath) return "/placeholder.svg"
  if (posterPath.startsWith("http")) return posterPath
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`
}

export default function WatchlistPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({})
  const [movieToDelete, setMovieToDelete] = useState<WatchlistItem | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  // Charger la watchlist
  const loadWatchlist = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      console.log("Loading watchlist for user:", user.uid)
      const watchlistRef = collection(db, "watchlist")
      const q = query(watchlistRef, where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)

      const watchlistData: WatchlistItem[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log("Raw watchlist data:", data)

        watchlistData.push({
          id: doc.id,
          userId: data.userId || user.uid,
          movieId: data.movieId || "",
          title: data.title || "Film sans titre",
          posterPath: data.posterPath || "",
          addedAt: validateAndConvertDate(data.addedAt),
          releaseDate: data.releaseDate || "",
          rating: data.rating || 0,
          genres: Array.isArray(data.genres) ? data.genres : [],
          description: data.description || "",
          duration: data.duration || "",
          urlmovie: data.urlmovie || ""
        })
      })

      console.log("Processed watchlist data:", watchlistData)
      setWatchlist(watchlistData)
    } catch (error) {
      console.error("Error loading watchlist:", error)
      setError("Erreur lors du chargement de votre watchlist")
    } finally {
      setLoading(false)
    }
  }

  // Gérer les erreurs de chargement d'image
  const handleImageError = (movieId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [movieId]: true
    }))
  }

  // Gérer le chargement réussi d'une image
  const handleImageLoad = (movieId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [movieId]: true
    }))
  }

  // Supprimer un film de la watchlist
  const removeFromWatchlist = async (movieId: string) => {
    if (!user || deletingItemId === movieId) return // Empêcher les suppressions multiples

    try {
      setDeletingItemId(movieId) // Déclencher l'état de suppression

      // Ajouter un délai pour permettre l'animation
      await new Promise(resolve => setTimeout(resolve, 300)) // Délai de 300ms pour l'animation

      const watchlistRef = doc(db, "watchlist", `${user.uid}_${movieId}`)
      await deleteDoc(watchlistRef)
      
      // Mettre à jour l'état local après la suppression
      setWatchlist(watchlist.filter(item => item.movieId !== movieId))
      
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
    }
  }

  useEffect(() => {
    loadWatchlist()
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connectez-vous</h1>
          <p className="text-gray-400 mb-6">
            Vous devez être connecté pour voir votre watchlist
        </p>
          <Button asChild>
            <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </div>
  )
  }

  if (loading) {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <X className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={loadWatchlist}>Réessayer</Button>
        </div>
      </div>
    )
  }

  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Votre watchlist est vide</h1>
          <p className="text-gray-400 mb-6">
            Ajoutez des films à votre watchlist pour les retrouver ici
          </p>
            <Button asChild>
            <Link href="/movies">Découvrir des films</Link>
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ma Watchlist</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {watchlist.map((item) => (
          <Card 
            key={item.id} 
            className={`bg-gray-900 border-gray-800 transition-all duration-300 ease-in-out ${
              deletingItemId === item.movieId ? 'opacity-0 transform scale-95' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="relative aspect-[2/3] mb-4 bg-gray-800 rounded-lg overflow-hidden">
                {!imagesLoaded[item.movieId] && !imageErrors[item.movieId] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                
                {imageErrors[item.movieId] ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <ImageIcon className="h-12 w-12 text-gray-600" />
                  </div>
                ) : (
                  <Image
                    src={getTMDBImageUrl(item.posterPath)}
                    alt={item.title}
                    fill
                    className={`object-cover transition-opacity duration-300 ${
                      imagesLoaded[item.movieId] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={() => handleImageError(item.movieId)}
                    onLoad={() => handleImageLoad(item.movieId)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    loading="lazy"
                  />
                )}
              </div>
              
              <h2 className="font-semibold mb-2 line-clamp-1">{item.title}</h2>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                {item.releaseDate && <span>{item.releaseDate}</span>}
                {item.duration && (
                  <>
                    <span>•</span>
                    <span>{item.duration}</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={() => setMovieToDelete(item)}
                  disabled={deletingItemId === item.movieId}
                >
                  Retirer
                </Button>
                
                <Button asChild variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                  <Link href={`/movies/${item.movieId}`}>
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-info"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      Détails
                    </span>
                  </Link>
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Ajouté {formatDate(item.addedAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!movieToDelete} onOpenChange={() => setMovieToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer "{movieToDelete?.title}" de votre watchlist ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => movieToDelete && removeFromWatchlist(movieToDelete.movieId)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

