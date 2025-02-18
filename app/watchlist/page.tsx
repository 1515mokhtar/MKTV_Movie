"use client"

import { useEffect, useState, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Trash2, Edit, MessageSquare, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"








interface Movie {
  id: string
  movieId: string
  title: string
  posterPath: string
  addedAt: any
  comment?: string
}

export default function WatchlistPage() {
  const [user, loading] = useAuthState(auth)
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [filteredWatchlist, setFilteredWatchlist] = useState<Movie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editComment, setEditComment] = useState("")
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
    // Implement delete functionality
    toast.success("Movie removed from watchlist")
  }

  const handleDeleteSelected = async () => {
    // Implement bulk delete functionality
    toast.success("Selected movies removed from watchlist")
  }

  const handleEdit = async (movieId: string) => {
    // Implement edit functionality
    toast.success("Movie updated successfully")
  }

  const handleSelectAll = (value: string) => {
    setShowCheckboxes(true)
    if (value === "all") {
      setSelectedMovies(filteredWatchlist.map((movie) => movie.id))
    } else {
      setSelectedMovies([])
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-primary to-secondary">
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to Your Watchlist</h1>
        <p className="text-xl text-white mb-8">Please log in or sign up to access your watchlist.</p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
        <Link href="/" className="mt-8 text-white hover:underline">
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" ref={pageRef}>
      <h1 className="text-4xl font-bold mb-8 text-primary">Your Watchlist</h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
        <div className="flex items-center gap-4">
          <Select onValueChange={handleSelectAll}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select movies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select All</SelectItem>
              <SelectItem value="none">Deselect All</SelectItem>
            </SelectContent>
          </Select>
          {selectedMovies.length > 0 && (
            <Button onClick={handleDeleteSelected} variant="destructive">
              Delete Selected ({selectedMovies.length})
            </Button>
          )}
        </div>
      </div>
      {filteredWatchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <AnimatePresence>
            {filteredWatchlist.map((movie) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-transparent rounded-lg shadow-lg overflow-hidden"
              >
            <Card className="overflow-hidden transition-transform hover:scale-105">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    />
{showCheckboxes && (
                    <Checkbox
                      checked={selectedMovies.includes(movie.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMovies((prev) => [...prev, movie.id])
                        } else {
                          setSelectedMovies((prev) => prev.filter((id) => id !== movie.id))
                        }
                      }}
                      className="absolute top-2 left-2"
                    />
                  )}
                  </div>

                 
                  <div className="flex  justify-between items-start">
                  <CardContent className="p-4">
                    <p className="font-semibold truncate">{movie.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added on: {new Date(movie.addedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <div className="p-4">
                  <div className="flex justify-between items-start">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Comment
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Comment</DialogTitle>
                            </DialogHeader>
                            <Textarea
                              placeholder="Write your comment here..."
                              value={movie.comment || ""}
                              onChange={(e) => {
                                const newComment = e.target.value
                                setWatchlist((prev) =>
                                  prev.map((m) => (m.id === movie.id ? { ...m, comment: newComment } : m)),
                                )
                              }}
                            />
                            <Button onClick={() => handleEdit(movie.id)} className="mt-2">
                              Save Comment
                            </Button>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem
                          onSelect={() => {
                            setIsEditing(movie.id)
                            setEditTitle(movie.title)
                            setEditComment(movie.comment || "")
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(movie.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </div>
                 
                  {movie.comment && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Comment: {movie.comment}</p>
                  )}
                </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {searchTerm ? "No movies found matching your search." : "Your watchlist is empty."}
        </p>
      )}
      

      {isEditing && (
        <Dialog open={!!isEditing} onOpenChange={() => setIsEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Movie</DialogTitle>
            </DialogHeader>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Movie Title"
              className="mb-4"
            />
            <Textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Comment (optional)"
              className="mb-4"
            />
            <Button onClick={() => handleEdit(isEditing)}>Save Changes</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
    
  )
}

