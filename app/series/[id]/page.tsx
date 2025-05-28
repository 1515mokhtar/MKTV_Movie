import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Calendar, Clock, TrendingUp, ChevronLeft } from "lucide-react"

async function getSeriesDetails(id: string) {
  // Use the API key as a query parameter for v3 endpoints
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY_V3;
  
  // *** ADDED LOGGING ***
  console.log("Fetching series details for ID:", id);
  console.log("Using API Key (first 5 chars):", apiKey ? apiKey.substring(0, 5) + "..." : "NOT CONFIGURED");
  // *** END ADDED LOGGING ***

  if (!apiKey) {
    console.error("TMDB API key (NEXT_PUBLIC_TMDB_API_V3) is not configured.");
    // Optionally handle this error more gracefully, e.g., redirect or show message
    notFound(); // Treat as not found if key is missing
  }

  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,similar,videos`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      // Remove Bearer token header
    },
    next: { revalidate: 60 * 60 * 24 }, // Revalidate every 24 hours
  });

  // *** ADDED LOGGING ***
  console.log("TMDB API Response Status:", res.status);
  if (!res.ok) {
    const errorData = await res.text().catch(() => "Could not parse error body"); // Use .text() for potentially non-JSON errors
    console.error("Error fetching series details:", {
      status: res.status,
      statusText: res.statusText,
      errorData: errorData,
      requestUrl: url, // Log the URL being requested
    });
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch series details: ${res.status} ${res.statusText}`);
  }
  // *** END ADDED LOGGING ***

  return res.json();
}

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
          <Button size="lg">Watch Now</Button>
          <Button size="lg" variant="outline">
            Add to Watchlist
          </Button>
        </div>
      </div>
    </div>
  )
}

function CastSection({ cast }: { cast: any[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {cast.slice(0, 6).map((actor) => (
          <Card key={actor.id} className="overflow-hidden">
            <div className="relative aspect-[2/3]">
              <Image
                src={
                  actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/placeholder-actor.png"
                }
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

function VideosSection({ videos }: { videos: any[] }) {
  // Filter for trailers and take the first few
  const trailers = videos.filter((video) => video.type === "Trailer" && video.site === "YouTube").slice(0, 3);

  if (trailers.length === 0) {
    return null; // Don't render the section if no trailers are found
  }

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Trailers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trailers.map((video) => (
          <div key={video.id} className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${video.key}`}
              title={video.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeasonsSection({ seasons, params }: { seasons: any[], params: { id: string } }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Seasons</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {seasons.map((season) => (
          <Link href={`/series/${params.id}/season/${season.season_number}`} key={season.id}>
            <Card className="overflow-hidden hover:opacity-80 transition-opacity">
              <div className="relative aspect-[2/3]">
                <Image
                  src={
                    season.poster_path
                      ? `https://image.tmdb.org/t/p/w200${season.poster_path}`
                      : "/placeholder-season.png"
                  }
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
          </Link>
        ))}
      </div>
    </section>
  )
}

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
                  src={
                    series.poster_path
                      ? `https://image.tmdb.org/t/p/w200${series.poster_path}`
                      : "/placeholder-series.png"
                  }
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

export default async function SeriesPage({ params }: { params: { id: string } }) {
  // Get seriesId from params immediately
  const seriesId = params.id; 
  let series;

  try {
    series = await getSeriesDetails(seriesId); // Use the local seriesId variable
  } catch (error) {
    console.error("Error fetching series details:", error);
    notFound();
  }

  // *** ADDED LOG ***
  console.log("SeriesPage rendering SeasonsSection with seriesId:", seriesId);
  // *** END ADDED LOG ***

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

      {/* Add Videos Section */}
      {series?.videos?.results && series.videos.results.length > 0 && (
        <Suspense fallback={<SectionSkeleton title="Trailers" />}>
          <VideosSection videos={series.videos.results} />
        </Suspense>
      )}

      <Suspense fallback={<SectionSkeleton title="Cast" />}>
        <CastSection cast={series.credits.cast} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Seasons" />}>
        <SeasonsSection seasons={series.seasons} params={params} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Similar Series" />}>
        <SimilarSeriesSection similarSeries={series.similar.results} />
      </Suspense>
    </div>
  )
}

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
        <div className="flex gap-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  )
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </section>
  )
}

