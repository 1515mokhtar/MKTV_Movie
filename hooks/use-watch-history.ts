import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './use-auth'

interface WatchHistoryItem {
  id: string
  movieId: string
  movieName: string
  thumbnail?: string
  watchedAt: Date
  progress: number
}

interface WatchProgress {
  progress: number
  currentTime: number
  duration: number
  lastWatched: Date
}

interface UseWatchHistoryProps {
  videoId: string
  onProgressLoad?: (progress: WatchProgress) => void
  autoSaveInterval?: number // in milliseconds
}

export function useWatchHistory({ 
  videoId, 
  onProgressLoad,
  autoSaveInterval = 10000 // 10 seconds default
}: UseWatchHistoryProps) {
  const { user } = useAuth()
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastSavedTime = useRef<number>(0)
  const saveTimeout = useRef<NodeJS.Timeout>()

  const fetchWatchHistory = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const historyRef = collection(db, 'watchHistory')
      const q = query(
        historyRef,
        where('userId', '==', user.uid),
        orderBy('watchedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        watchedAt: doc.data().watchedAt.toDate()
      })) as WatchHistoryItem[]
      
      setHistory(historyData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watch history')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = useCallback(async (movieData: {
    movieId: string
    movieName: string
    thumbnail?: string
    progress: number
  }) => {
    if (!user) return

    try {
      const response = await fetch('/api/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          ...movieData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update watch history')
      }

      // Refresh history after successful update
      await fetchWatchHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update watch history')
    }
  }, [user])

  const clearHistory = async () => {
    if (!user) return

    try {
      const historyRef = collection(db, 'watchHistory')
      const q = query(historyRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      
      // Mark all history items as deleted
      const deletePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { deleted: true })
      )
      
      await Promise.all(deletePromises)
      await fetchWatchHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear watch history')
    }
  }

  // Load saved progress
  const loadProgress = useCallback(async () => {
    if (!user?.uid || !videoId) return

    try {
      setIsLoading(true)
      const docRef = doc(db, 'users', user.uid, 'watchHistory', videoId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const progress: WatchProgress = {
          progress: data.progress || 0,
          currentTime: data.currentTime || 0,
          duration: data.duration || 0,
          lastWatched: data.lastWatched?.toDate() || new Date()
        }
        
        onProgressLoad?.(progress)
        lastSavedTime.current = data.currentTime || 0
      }
    } catch (err) {
      console.error('Error loading watch progress:', err)
      setError('Failed to load watch progress')
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, videoId, onProgressLoad])

  // Save progress
  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!user?.uid || !videoId) return

    try {
      // Calculate progress percentage
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0
      
      // Only save if progress has changed significantly
      if (Math.abs(lastSavedTime.current - currentTime) < 1) return

      const docRef = doc(db, 'users', user.uid, 'watchHistory', videoId)
      await setDoc(docRef, {
        userId: user.uid,
        videoId,
        progress,
        currentTime,
        duration,
        lastWatched: serverTimestamp()
      }, { merge: true })

      lastSavedTime.current = currentTime
    } catch (err) {
      console.error('Error saving watch progress:', err)
      setError('Failed to save watch progress')
    }
  }, [user?.uid, videoId])

  // Auto-save progress
  const startAutoSave = useCallback((currentTime: number, duration: number) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    saveTimeout.current = setTimeout(() => {
      saveProgress(currentTime, duration)
    }, autoSaveInterval)
  }, [saveProgress, autoSaveInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchWatchHistory()
    }
  }, [user])

  return {
    history,
    isLoading,
    error,
    updateProgress,
    refreshHistory: fetchWatchHistory,
    clearHistory,
    loadProgress,
    saveProgress,
    startAutoSave
  }
} 