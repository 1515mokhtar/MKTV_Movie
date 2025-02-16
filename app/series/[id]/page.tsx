import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Calendar, Clock, TrendingUp, ChevronLeft } from "lucide-react"

// Define type for props
type SeriesPageProps = {
  params: {
    id: string;
  };
};

// Fetch series details based on the ID
async function getSeriesDetails(id: string) {
  const url = `https://api.themoviedb.org/3/tv/${id}?append_to_response=credits,similar&language=en-US`

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
    next: { revalidate: 60 * 60 * 24 }, // Revalidate every 24 hours
  })

  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error("Failed to fetch series details")
  }

  return res.json()
}

// Series information component
function SeriesInfo({ series }: { series: any }) {
  return (
    <div className="grid gap-8 md:grid-cols-[2fr,3fr] lg:gap-12">
      <div className="relative aspect-[2/3] w-full max-w-md mx-auto md:mx-0">
        <Image
          src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
          alt={series.name}
          fill
          className="object-cover rounded-lg shadow-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{series.name}</h1>
        <div className="flex flex-wrap gap-2">
          {series.genres.map((genre: any) => (
            <Badge key={genre.id} variant="secondary" className="px-3 py-1 text-sm">
              {genre.name}
            </Badge>
          ))}
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">{series.overview}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
            <Star className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-semibold">{series.vote_average.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">Rating</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">{new Date(series.first_air_date).getFullYear()}</span>
            <span className="text-sm text-muted-foreground">Year</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
            <Clock className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold">{series.episode_run_time[0]}</span>
            <span className="text-sm text-muted-foreground">Minutes</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <span className="text-lg font-semibold">{series.popularity.toFixed(0)}</span>
            <span className="text-sm text-muted-foreground">Popularity</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href={`/serieswatch/${series.id}`}>
          <Button size="lg">Watch Now</Button>
          </Link>
          <Button size="lg" variant="outline">
            Add to Watchlist
          </Button>
        </div>
      </div>
    </div>
  )
}

// Cast section
function CastSection({ cast }: { cast: any[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {cast.slice(0, 6).map((actor) => (
          <Card key={actor.id} className="overflow-hidden">
            <div className="relative aspect-[2/3]">
              <Image
                src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/placeholder-actor.png"}
                alt={actor.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              />
            </div>
            <CardContent className="p-4">
              <p className="font-semibold truncate">{actor.name}</p>
              <p className="text-sm text-muted-foreground truncate">{actor.character}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

// Seasons section
function SeasonsSection({ seasons }: { seasons: any[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Seasons</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {seasons.map((season) => (
          <Card key={season.id} className="overflow-hidden">
            <div className="relative aspect-[2/3]">
              <Image
                src={season.poster_path ? `https://image.tmdb.org/t/p/w200${season.poster_path}` : "/placeholder-season.png"}
                alt={season.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              />
            </div>
            <CardContent className="p-4">
              <p className="font-semibold truncate">{season.name}</p>
              <p className="text-sm text-muted-foreground">{season.episode_count} episodes</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

// Similar series section
function SimilarSeriesSection({ similarSeries }: { similarSeries: any[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Similar Series</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {similarSeries.slice(0, 6).map((series) => (
          <Link href={`/series/${series.id}`} key={series.id}>
            <Card className="overflow-hidden transition-transform hover:scale-105">
              <div className="relative aspect-[2/3]">
                <Image
                  src={series.poster_path ? `https://image.tmdb.org/t/p/w200${series.poster_path}` : "/placeholder-series.png"}
                  alt={series.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                />
              </div>
              <CardContent className="p-4">
                <p className="font-semibold truncate">{series.name}</p>
                <p className="text-sm text-muted-foreground">{new Date(series.first_air_date).getFullYear()}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

// Main Series Page Component
export default async function SeriesPage({ params }: { params: { id: string } }) {
  let series
  try {
    series = await getSeriesDetails(params.id)
  } catch (error) {
    console.error("Error fetching series details:", error)
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <Link
        href="/series"
        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Series
      </Link>
      <Suspense fallback={<SeriesInfoSkeleton />}>
        <SeriesInfo series={series} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Cast" />}>
        <CastSection cast={series.credits.cast} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Seasons" />}>
        <SeasonsSection seasons={series.seasons} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Similar Series" />}>
        <SimilarSeriesSection similarSeries={series.similar.results} />
      </Suspense>
    </div>
  )
}

// Loading skeleton for SeriesInfo
function SeriesInfoSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[2fr,3fr] lg:gap-12">
      <Skeleton className="aspect-[2/3] w-full max-w-md mx-auto md:mx-0" />
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton for sections
function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </section>
  )
}
