"use client"

import { useWatchHistory } from "@/hooks/use-watch-history"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function HistoryPage() {
  const { history, loading, error, clearHistory } = useWatchHistory()
  const { toast } = useToast()

  const handleClearHistory = async () => {
    try {
      await clearHistory()
      toast({
        title: "Historique effacé",
        description: "Votre historique de visionnage a été effacé avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effacer l'historique. Veuillez réessayer.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="text-red-500 text-center">
          Error loading watch history: {error}
        </div>
      </div>
    )
  }

  if (!history.length) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-6">Historique de visionnage</h1>
        <div className="text-gray-400 text-center">
          Vous n'avez pas encore d'historique de visionnage
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Historique de visionnage</h1>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleClearHistory}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Effacer l'historique
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {history.map((item) => (
          <Link 
            href={`/watch/${item.movieId}`} 
            key={item.id}
            className="group"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.movieName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-red-600 h-1.5 rounded-full" 
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
            <h3 className="font-medium text-sm line-clamp-1">{item.movieName}</h3>
            <p className="text-gray-400 text-xs">
              Vu il y a {formatDistanceToNow(item.watchedAt, { locale: fr })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
} 