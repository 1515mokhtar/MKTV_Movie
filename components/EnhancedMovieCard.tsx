"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MoreVertical, MessageSquare, Trash2, Star } from "lucide-react"

interface EnhancedMovieCardProps {
  movie: {
    id: string
    title: string
    releaseDate?: string
    poster_path?: string
    posterPath?: string
    addedAt?: { toDate: () => Date }
    comment?: string
    rating?: number
  }
  isWatchlist?: boolean
  showCheckboxes?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onEdit?: (id: string, newComment: string) => void
  onDelete?: (id: string) => void
  onRate?: (id: string, rating: number) => void
}

export function EnhancedMovieCard({
  movie,
  isWatchlist = false,
  showCheckboxes = false,
  onSelect,
  onEdit,
  onDelete,
  onRate,
}: EnhancedMovieCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editComment, setEditComment] = useState(movie.comment || "")
  const [isSelected, setIsSelected] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.posterPath
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
      : "/placeholder-movie.png"

  const handleSelect = (checked: boolean) => {
    setIsSelected(checked)

    onSelect && onSelect(movie.id, checked)
    setIsHovered(true)

  }

  const handleEditComment = () => {
    onEdit && onEdit(movie.id, editComment)
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-card h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3]">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {isWatchlist && (
            <div
              className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >

          {showCheckboxes && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              className="absolute top-2 left-2 bg-white/80 rounded-full p-1 transition-opacity duration-300 opacity-70 hover:opacity-100"
            />
          )}
              <div className="flex space-x-1">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold">{movie.rater}</span>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow flex flex-col ">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{movie.title}</h3>
            {movie.releaseDate && (
              <p className="text-sm text-muted-foreground mb-2">{new Date(movie.releaseDate).getFullYear()}</p>
            )}
            {isWatchlist && movie.addedAt && (
              <p className="text-xs text-muted-foreground mb-2">
                Added: {new Date(movie.addedAt.toDate()).toLocaleDateString()}
              </p>
            )}
            {movie.comment && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{movie.comment}</p>}
          </div>
          {isWatchlist && (
            <div className="mt-auto flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {movie.comment ? "Edit Comment" : "Add Comment"}
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{movie.comment ? "Edit Comment" : "Add Comment"}</DialogTitle>
                      </DialogHeader>
                      <Textarea
                        placeholder="Write your comment here..."
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button onClick={handleEditComment} className="mt-2">
                        Save Comment
                      </Button>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem onSelect={() => onDelete && onDelete(movie.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove from Watchlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

