import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Calendar, Clock, TrendingUp, ChevronLeft } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { SeriesCard } from "@/components/series-card"
import { headers } from 'next/headers'
import { SeriesActions } from "./series-actions"

interface SeriesDetailData {
  id: number;
  name: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  popularity: number;
  episode_run_time: number[];
  genres: Array<{ id: number; name: string }>;
  credits?: { cast: any[]; crew: any[] };
  similar?: { results: any[] };
  videos?: { results: any[] };
  episode_groups?: any[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_count?: number;
  seasons?: any[];
}

async function getSeriesDetails(id: string, referer: string | null): Promise<SeriesDetailData> {
  const seriesDocRef = doc(db, "series", id); // Firebase document reference
  let seriesData: SeriesDetailData | null = null;
  let fetchedFromFirebase = false;

  const fetchFromFirebaseOnly = referer?.includes("/series/seriesdisponible") || false;
  const fetchFromTmdbOnly = referer?.includes("/series") && !fetchFromFirebaseOnly || false;

  // Scenario 1: Fetch only from Firebase (from /series/seriesdisponible)
  if (fetchFromFirebaseOnly) {
    try {
      const firebaseDoc = await getDoc(seriesDocRef);
      if (firebaseDoc.exists()) {
        seriesData = firebaseDoc.data() as SeriesDetailData;
        console.log(`Using Firebase data for series ${id} (from /series/seriesdisponible)`);
      } else {
        console.log(`Series ${id} not found in Firebase (from /series/seriesdisponible).`);
        notFound(); // If explicitly from firebase page, and not found, treat as not found
      }
    } catch (firebaseErr) {
      console.error(`Error fetching series ${id} from Firebase (from /series/seriesdisponible):`, firebaseErr);
      notFound(); // If error, treat as not found
    }
    console.log("SeriesData returned from Firebase only scenario:", seriesData);
    return seriesData;
  }

  // Scenario 2: Fetch only from TMDB (from /series)
  if (fetchFromTmdbOnly) {
    console.log(`Fetching TMDB data for series ${id} (from /series)`);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY_V3;
    if (!apiKey) {
      console.error("TMDB API Key is missing. Cannot fetch series details.");
      notFound();
    }

    const [episodeGroupsRes, seriesDetailsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${id}/episode_groups?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,similar,videos`)
    ]);

    let episodeGroups = [];
    if (episodeGroupsRes.ok) {
      const episodeGroupsData = await episodeGroupsRes.json();
      episodeGroups = episodeGroupsData.results || [];
    }

    if (!seriesDetailsRes.ok) {
      if (seriesDetailsRes.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch series details from TMDB: ${seriesDetailsRes.status} ${seriesDetailsRes.statusText}`);
    }

    const tmdbData = await seriesDetailsRes.json();
    seriesData = {
      id: tmdbData.id,
      name: tmdbData.name,
      overview: tmdbData.overview,
      backdrop_path: tmdbData.backdrop_path,
      poster_path: tmdbData.poster_path,
      first_air_date: tmdbData.first_air_date,
      vote_average: tmdbData.vote_average,
      popularity: tmdbData.popularity,
      episode_run_time: tmdbData.episode_run_time,
      genres: tmdbData.genres,
      credits: tmdbData.credits,
      similar: tmdbData.similar,
      videos: tmdbData.videos,
      episode_groups: episodeGroups,
      number_of_seasons: tmdbData.number_of_seasons,
      number_of_episodes: tmdbData.number_of_episodes,
      vote_count: tmdbData.vote_count,
      seasons: tmdbData.seasons,
    };
    console.log("TMDB Data for getSeriesDetails (Scenario 2):", tmdbData);
    console.log("SeriesData returned from TMDB only scenario:", seriesData);
    return seriesData;
  }

  // Scenario 3: Hybrid approach (Firebase first, then TMDB fallback) - for other referers or direct access
  console.log(`Attempting hybrid fetch for series ${id} (referer: ${referer})`);
  try {
    const firebaseDoc = await getDoc(seriesDocRef);
    if (firebaseDoc.exists()) {
      const data = firebaseDoc.data() as SeriesDetailData;
      if (data.name && data.overview && data.poster_path && data.vote_average !== undefined && data.popularity !== undefined) {
        console.log(`Using cached Firebase data for series ${id} (hybrid mode)`);
        seriesData = data;
        fetchedFromFirebase = true;
      }
    }
  } catch (firebaseErr) {
    console.error(`Error fetching series ${id} from Firebase (hybrid mode):`, firebaseErr);
  }
  console.log("SeriesData before TMDB fallback (Hybrid scenario):", seriesData);
  if (!seriesData || !fetchedFromFirebase) {
    console.log(`Fetching TMDB data for series ${id} (hybrid mode fallback)`);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY_V3;
    if (!apiKey) {
      console.error("TMDB API Key is missing. Cannot fetch series details.");
      notFound();
    }

    const [episodeGroupsRes, seriesDetailsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${id}/episode_groups?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,similar,videos`)
    ]);

    let episodeGroups = [];
    if (episodeGroupsRes.ok) {
      const episodeGroupsData = await episodeGroupsRes.json();
      episodeGroups = episodeGroupsData.results || [];
    }

    if (!seriesDetailsRes.ok) {
      if (seriesDetailsRes.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch series details from TMDB: ${seriesDetailsRes.status} ${seriesDetailsRes.statusText}`);
    }

    const tmdbData = await seriesDetailsRes.json();
    seriesData = {
      id: tmdbData.id,
      name: tmdbData.name,
      overview: tmdbData.overview,
      backdrop_path: tmdbData.backdrop_path,
      poster_path: tmdbData.poster_path,
      first_air_date: tmdbData.first_air_date,
      vote_average: tmdbData.vote_average,
      popularity: tmdbData.popularity,
      episode_run_time: tmdbData.episode_run_time,
      genres: tmdbData.genres,
      credits: tmdbData.credits,
      similar: tmdbData.similar,
      videos: tmdbData.videos,
      episode_groups: episodeGroups,
      number_of_seasons: tmdbData.number_of_seasons,
      number_of_episodes: tmdbData.number_of_episodes,
      vote_count: tmdbData.vote_count,
      seasons: tmdbData.seasons,
    };

    console.log("TMDB Data for getSeriesDetails (Scenario 3 Fallback):", tmdbData);

    try {
      await setDoc(seriesDocRef, seriesData, { merge: true });
      console.log(`Successfully cached full TMDB data for series ${id} to Firebase (hybrid mode).`);
    } catch (saveErr) {
      console.error(`Failed to save full TMDB data for series ${id} to Firebase (hybrid mode):`, saveErr);
    }
  }

  if (!seriesData) {
    notFound();
  }

  console.log("Final SeriesData returned from getSeriesDetails:", seriesData);
  return seriesData;
}

async function getPartsList(id: string) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY_V3;
  if (!apiKey) return [];
  const episodeGroupsUrl = `https://api.themoviedb.org/3/tv/${id}/episode_groups?api_key=${apiKey}`;
  const episodeGroupsRes = await fetch(episodeGroupsUrl);
  if (!episodeGroupsRes.ok) return [];
  const episodeGroupsData = await episodeGroupsRes.json();
  const partsGroup = episodeGroupsData.results.find((group: any) => group.name === "Parts (edited version)");
  if (!partsGroup) return [];
  const groupUrl = `https://api.themoviedb.org/3/tv/episode_group/${partsGroup.id}?api_key=${apiKey}`;
  const groupRes = await fetch(groupUrl);
  if (!groupRes.ok) return [];
  const groupData = await groupRes.json();
  // Each subgroup is a part (e.g., Part 1, Part 2, ...)
  return groupData.groups.map((sub: any) => ({
    id: sub.id,
    name: sub.name,
    partNumber: (sub.name.match(/Part (\d+)/) || [])[1],
    poster_path: sub.poster_path, // Only use subgroup poster here
    episode_count: sub.episodes.length,
  })).filter((sub: any) => sub.partNumber);
}

function SeriesInfo({ series }: { series: SeriesDetailData }) {
  console.log("Series data in SeriesInfo:", series);
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
          {series.genres.map((genre) => (
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
            <span className="text-lg font-semibold">{series.episode_run_time?.[0] ?? "N/A"}</span>
            <span className="text-sm text-muted-foreground">Minutes</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <span className="text-lg font-semibold">{series.popularity?.toFixed(0) ?? "N/A"}</span>
            <span className="text-sm text-muted-foreground">Popularity</span>
          </div>
        </div>
        <SeriesActions series={series} />
      </div>
    </div>
  );
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
  const trailer = videos.find((video) => video.type === "Trailer" && video.site === "YouTube");

  if (!trailer) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Trailer</h2>
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${trailer.key}`}
          title={trailer.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="border-0"
        ></iframe>
      </div>
    </section>
  );
}

function SeasonsSection({ seasons, params }: { seasons: any[], params: { id: string } }) {
  console.log("Seasons data in SeasonsSection:", seasons);
  if (!seasons || seasons.length === 0) {
    return null;
  }
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Seasons</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {seasons.map((season) => (
          <Link key={season.id} href={`/series/${params.id}/season/${season.season_number}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[2/3]">
                <Image
                  src={season.poster_path ? `https://image.tmdb.org/t/p/w300${season.poster_path}` : "/placeholder.svg"}
                  alt={season.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold line-clamp-1">{season.name}</h3>
                <p className="text-sm text-muted-foreground">{season.episode_count} Episodes</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SimilarSeriesSection({ similarSeries }: { similarSeries: any[] }) {
  if (!similarSeries || similarSeries.length === 0) {
    return null;
  }
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Similar Series</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {similarSeries.slice(0, 5).map((similar) => (
          <SeriesCard
            key={similar.id}
            id={similar.id}
            title={similar.name}
            genre={similar.genre_ids.map((id: number) => `Genre ${id}`).join(", ")}
            releaseDate={similar.first_air_date ? new Date(similar.first_air_date).getFullYear().toString() : "N/A"}
            poster={similar.poster_path ? `https://image.tmdb.org/t/p/w300${similar.poster_path}` : "/placeholder.svg"}
          />
        ))}
      </div>
    </section>
  );
}

function PartsSection({ parts, seriesId, seriesPosterPath }: { parts: any[], seriesId: string, seriesPosterPath?: string | null }) {
  if (!parts || parts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Parts</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {parts.map((part) => (
          <Link key={part.id} href={`/series/${seriesId}/part/${part.partNumber}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[2/3]">
                <Image
                  src={part.poster_path ? `https://image.tmdb.org/t/p/w300${part.poster_path}` : seriesPosterPath ? `https://image.tmdb.org/t/p/w300${seriesPosterPath}` : "/placeholder.svg"}
                  alt={part.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold line-clamp-1">{part.name}</h3>
                <p className="text-sm text-muted-foreground">{part.episode_count} Episodes</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function SeriesPage({ params }: { params: { id: string } }) {
  const headersList = headers();
  const referer = headersList.get('referer');

  const series = await getSeriesDetails(params.id, referer);
  console.log("Series.seasons before SeasonsSection (in SeriesPage):", series?.seasons);

  return (
    <div className="container mx-auto py-8">
      <Link href="/series" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-5 h-5" />
        Back to all series
      </Link>
      <Suspense fallback={<SeriesInfoSkeleton />}>
        {series ? (
          <SeriesInfo series={series} />
        ) : (
          <div className="text-center text-xl text-muted-foreground py-20">
            <p>Series details could not be loaded.</p>
            <p>Please check the series ID or try again later.</p>
          </div>
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Cast" />}>
        {series?.credits?.cast && series.credits.cast.length > 0 && (
          <CastSection cast={series.credits.cast} />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Trailer" />}>
        {series?.videos?.results && series.videos.results.length > 0 && (
          <VideosSection videos={series.videos.results} />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Seasons" />}>
        {series?.seasons && (
          <SeasonsSection seasons={series.seasons} params={params} />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Similar Series" />}>
        {series?.similar?.results && series.similar.results.length > 0 && (
          <SimilarSeriesSection similarSeries={series.similar.results} />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Parts" />}>
        {series?.episode_groups && series.episode_groups.length > 0 && (
          <PartsSection parts={await getPartsList(params.id)} seriesId={params.id} seriesPosterPath={series.poster_path} />
        )}
      </Suspense>
    </div>
  );
}

function SeriesInfoSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[2fr,3fr] lg:gap-12">
      <div className="relative aspect-[2/3] w-full max-w-md mx-auto md:mx-0">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    </section>
  );
}

