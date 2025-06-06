'use client'
import { useState } from "react";
import { AllMoviesGrid } from "@/components/all-movies-grid"
import { MovieFilters } from "@/components/movie-filters"

export default function MoviesPage() {
  const [page, setPage] = useState(1);
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">TV Movies</h1>
        </div>
        <AllMoviesGrid page={page} onPageChange={setPage} />
      </div>
    </div>
  )
}

