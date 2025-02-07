import { MovieGrid } from "@/components/movie-grid"

export default function WatchlistPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Most Popular</h1>
          <p className="text-muted-foreground">Trending content based on views</p>
        </div>
        <MovieGrid orderBy="views" />
      </div>
    </div>
  )
}

