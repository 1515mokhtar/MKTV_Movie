"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'

interface MovieData {
  name: string
  urlmovie: string
}

// Simuler des serveurs alternatifs
const mockServers = [
  { id: 1, name: 'Serveur 1', quality: 'HD' },
  { id: 2, name: 'Serveur 2', quality: 'Full HD' },
  { id: 3, name: 'Serveur 3', quality: '4K' },
]

export default function WatchPage() {
  const params = useParams()
  const [movie, setMovie] = useState<MovieData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        console.log('Fetching movie with ID:', params.id)
        const docRef = doc(db, 'movies', params.id as string)
        console.log('Document reference created:', docRef.path)
        
        const docSnap = await getDoc(docRef)
        console.log('Document snapshot:', docSnap.exists() ? 'exists' : 'does not exist')
        
        if (docSnap.exists()) {
          const movieData = docSnap.data() as MovieData
          console.log('Movie data:', movieData)
          setMovie(movieData)
        } else {
          console.log('Movie not found in Firestore')
          setError('Film non trouvé dans la base de données')
        }
      } catch (err) {
        console.error('Error fetching movie:', err)
        setError('Erreur lors de la récupération du film: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || 'Film non trouvé'}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{movie.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone vidéo principale */}
        <div className="lg:col-span-2">
          <div className="aspect-video w-full">
            <iframe
              src={movie.urlmovie}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>

        {/* Liste des serveurs */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Serveurs disponibles</h2>
          <div className="space-y-4">
            {mockServers.map((server) => (
              <button
                key={server.id}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                onClick={() => {
                  // Ici, vous pourriez changer l'URL du film en fonction du serveur
                  // Pour l'exemple, nous gardons la même URL
                  window.location.href = `/watch/${params.id}?server=${server.id}`
                }}
              >
                <div className="font-medium">{server.name}</div>
                <div className="text-sm text-gray-400">{server.quality}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

