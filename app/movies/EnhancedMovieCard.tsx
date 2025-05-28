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
import { MoreVertical, MessageSquare, Edit, Trash2 } from "lucide-react"

interface EnhancedMovieCardProps {
  movie: {
    id: string
    title: string
    releaseDate?: string
    poster_path?: string
    posterPath?: string
    addedAt?: { toDate: () => Date }
    comment?: string
  }
  isWatchlist?: boolean
  showCheckboxes?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onEdit?: (id: string, newComment: string) => void
  onDelete?: (id: string) => void
  showYear?: boolean
}

export function EnhancedMovieCard({
  movie,
  isWatchlist = false,
  showCheckboxes = false,
  onSelect,
  onEdit,
  onDelete,
  showYear,
}: EnhancedMovieCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editComment, setEditComment] = useState(movie.comment || "")

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
    : movie.posterPath
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
      : "/placeholder-actor.png"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden transition-transform hover:scale-105 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="relative aspect-[2/3]">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          />
          {showCheckboxes && onSelect && (
            <Checkbox
              checked={false} // You need to manage this state
              onCheckedChange={(checked) => onSelect(movie.id, checked as boolean)}
              className="absolute top-2 left-2 bg-white"
            />
          )}
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold truncate text-xs sm:text-base">{movie.title}</h3>
              {movie.releaseDate && showYear !== false && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {new Date(movie.releaseDate).getFullYear()}
                </p>
              )}
              {isWatchlist && movie.addedAt && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Added on: {new Date(movie.addedAt.toDate()).toLocaleDateString()}
                </p>
              )}
            </div>
            {isWatchlist && (
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
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          onEdit && onEdit(movie.id, editComment)
                          setIsEditing(false)
                        }}
                        className="mt-2"
                      >
                        Save Comment
                      </Button>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete && onDelete(movie.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {movie.comment && <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Comment: {movie.comment}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Compare this snippet from app/movies/EnhancedMovieCard.tsx: