import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/use-auth'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Loader2 } from 'lucide-react'

interface WatchHistoryItem {
  id: string
  movieId: string
  movieName: string
  thumbnail?: string
  progress: number
  currentTime: number
  duration: number
  lastWatched: Date
}

export function WatchHistoryList() {
  const { user } = useAuth()
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const historyRef = collection(db, 'users', user.uid, 'watchHistory')
        const q = query(
          historyRef,
          orderBy('lastWatched', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastWatched: doc.data().lastWatched?.toDate() || new Date()
        })) as WatchHistoryItem[]
        
        setHistory(historyData)
      } catch (err) {
        console.error('Error fetching watch history:', err)
        setError('Failed to load watch history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user?.uid])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        Aucun historique de visionnage
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Link
          key={item.id}
          href={`/watch/${item.movieId}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-16 h-9 rounded overflow-hidden flex-shrink-0">
            <Image
              src={item.thumbnail || "/placeholder.svg"}
              alt={item.movieName}
              fill
              className="object-cover"
            />
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {item.movieName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(item.lastWatched, { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
              <span>•</span>
              <span>
                {Math.floor(item.progress)}% regardé
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 