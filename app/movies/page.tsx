'use client'
import { MovieGrid } from "@/components/movie-grid"
import { MovieFilters } from "@/components/movie-filters"


export default function MoviesPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">TV Movies</h1>
          <p className="text-muted-foreground">Showing latest releases first</p>
        </div>
        <MovieGrid type="Movies" orderBy="date" />
      </div>
    </div>
  )
}

