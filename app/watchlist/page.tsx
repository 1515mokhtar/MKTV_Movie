"use client"

import { useEffect, useState, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { EnhancedMovieCard } from "@/components/EnhancedMovieCard"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { LoginPrompt } from "@/components/LoginPrompt"
import Link from "next/link"
import { NavigationMenuItem, NavigationMenuContent, NavigationMenuLink, NavigationMenuTrigger } from "@/components/ui/navigation-menu"

interface Movie {
  id: string
  movieId: string
  title: string
  posterPath: string
  addedAt: any
  comment?: string
  releaseDate?: string
}

export default function WatchlistPage() {
  const [user, loading] = useAuthState(auth)
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [filteredWatchlist, setFilteredWatchlist] = useState<Movie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<string[]>([])
  const [showCheckboxes, setShowCheckboxes] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return

      try {
        const watchlistQuery = query(collection(db, "watchlist"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(watchlistQuery)
        const movies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Movie[]

        setWatchlist(movies)
        setFilteredWatchlist(movies)
      } catch (error) {
        console.error("Error fetching watchlist:", error)
        toast.error("Failed to load watchlist")
      }
    }

    fetchWatchlist()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageRef.current && !pageRef.current.contains(event.target as Node)) {
        setShowCheckboxes(false)
        setSelectedMovies([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const filtered = watchlist.filter((movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredWatchlist(filtered)
  }, [searchTerm, watchlist])

  const handleDelete = async (movieId: string) => {
    try {
      await deleteDoc(doc(db, "watchlist", movieId))
      setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId))
      toast.success("Movie removed from watchlist")
    } catch (error) {
      console.error("Error deleting movie:", error)
      toast.error("Failed to delete movie")
    }
  }

  const handleDeleteSelected = async () => {
    try {
      const batch = selectedMovies.map((id) => deleteDoc(doc(db, "watchlist", id)))
      await Promise.all(batch)
      setWatchlist((prev) => prev.filter((movie) => !selectedMovies.includes(movie.id)))
      setSelectedMovies([])
      toast.success("Selected movies removed from watchlist")
    } catch (error) {
      console.error("Error deleting selected movies:", error)
      toast.error("Failed to delete selected movies")
    }
  }

  const handleEdit = async (movieId: string, newComment: string) => {
    try {
      const movieRef = doc(db, "watchlist", movieId)
      await updateDoc(movieRef, {
        comment: newComment,
      })
      setWatchlist((prev) => prev.map((movie) => (movie.id === movieId ? { ...movie, comment: newComment } : movie)))
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Error updating movie:", error)
      toast.error("Failed to update comment")
    }
  }

  const handleSelectAll = (value: string) => {
    setShowCheckboxes(true)
    if (value === "all") {
      setSelectedMovies(filteredWatchlist.map((movie) => movie.id))
      
    } else {
      setSelectedMovies([])
    }
  }

  if (loading) return <LoadingSpinner />
  if (!user) return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-2 py-8 bg-gradient-to-br from-primary/10 to-background/90">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6 rounded-xl shadow-lg bg-background/90 p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">Welcome to Your Watchlist</h2>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          Please log in or sign up to access your watchlist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
        <Button asChild variant="ghost" className="w-full sm:w-auto">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" ref={pageRef}>
      <h1 className="text-3xl sm:text-4xl font-bold text-primary">Your Watchlist</h1>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
          <Select onValueChange={handleSelectAll}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select movies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select All</SelectItem>
              <SelectItem value="none">Deselect All</SelectItem>
            </SelectContent>
          </Select>
          {selectedMovies.length > 0 && (
            <Button onClick={handleDeleteSelected} variant="destructive" className="w-full md:w-auto">
              Delete Selected ({selectedMovies.length})
            </Button>
          )}
        </div>
      </div>

      {filteredWatchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredWatchlist.map((movie) => (
              <EnhancedMovieCard
                key={movie.id}
                movie={movie}
                isWatchlist={true}
                showCheckboxes={showCheckboxes}
                onSelect={(id, checked) => {
                  if (checked) {
                    setSelectedMovies((prev) => [...prev, id])
                  } else {
                    setSelectedMovies((prev) => prev.filter((movieId) => movieId !== id))
                  }
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "No movies found matching your search." : "Your watchlist is empty."}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link href="/movies/id">Browse Movies</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

