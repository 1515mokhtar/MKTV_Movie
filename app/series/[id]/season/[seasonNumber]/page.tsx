import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

async function getSeasonDetails(params: { id: string, seasonNumber: string }) {
  const seriesId = params.id;
  const seasonNumber = params.seasonNumber;

  console.log("DEBUG: Inside getSeasonDetails - Explicitly accessed Series ID:", seriesId, "Season Number:", seasonNumber);

  console.log("Fetching season details for Series ID:", seriesId, "Season Number:", seasonNumber);
  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN;
  console.log("Using Access Token (first 5 chars):", accessToken ? accessToken.substring(0, 5) + "..." : "NOT CONFIGURED");

  if (!accessToken) {
    console.error("TMDB Read Access Token (TMDB_READ_ACCESS_TOKEN) is not configured.");
    notFound();
  }

  const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?language=en-US`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  console.log("TMDB Season API Response Status:", res.status);
  if (!res.ok) {
    const errorData = await res.text().catch(() => "Could not parse error body");
    console.error("Error fetching season details:", {
      status: res.status,
      statusText: res.statusText,
      errorData: errorData,
      requestUrl: url,
    });
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch season details: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export default async function SeasonPage({ params }: { params: { id: string, seasonNumber: string } }) {
  let seasonDetails;
  try {
    seasonDetails = await getSeasonDetails(params);
  } catch (error) {
    console.error("Error loading season details:", error);
    notFound();
  }

  const episodes = seasonDetails?.episodes || [];

  // Log still_path for each episode here, outside of JSX
  episodes.forEach((episode: any) => {
    console.log(`Episode ${episode.episode_number} Still Path:`, episode.still_path);
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Link href={`/series/${params.id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
         <ChevronLeft className="w-4 h-4 mr-2" />
         Back to Series Details
      </Link>

      <h1 className="text-4xl font-bold">{seasonDetails?.name || `Season ${params.seasonNumber}`}</h1>

      {seasonDetails?.episode_count && (
         <p className="text-lg text-muted-foreground">{seasonDetails.episode_count} episodes</p>
      )}

      {/* List Episodes as Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {episodes.length > 0 ? (
          episodes.map((episode: any) => (
            <div key={episode.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col">
              {/* Episode Poster Image */}
              <div className="relative aspect-video w-full border-2 border-dashed border-red-500">
                <Image
                  src={
                    episode.still_path
                      ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                      : "/placeholder-episode.png" // Use a placeholder if no still_path
                  }
                  alt={`Episode ${episode.episode_number}: ${episode.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              {/* Episode Info */}
              <div className="p-4 flex-grow">
                <h2 className="font-semibold text-lg">E{episode.episode_number}: {episode.name}</h2>
                {episode.overview && (
                   <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{episode.overview}</p>
                )}
              </div>
              {/* Watch Button */}
              <div className="p-4 pt-0">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Watch Episode
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border p-4 rounded-lg text-center text-muted-foreground">No episodes found for this season.</div>
        )}
      </div>
    </div>
  );
} 