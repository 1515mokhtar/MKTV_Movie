"use client";
import { MovieGrid } from "@/components/movie-grid"
import {SeriesGrid} from "@/components/serie-grid" // Import the SeriesGrid component


export default function SeriesPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">TV Series</h1>
          <p className="text-muted-foreground">Showing latest releases first</p>
        </div>
        
          <SeriesGrid /> // Add the SeriesGrid component
      </div>
    </div>
  )
}

