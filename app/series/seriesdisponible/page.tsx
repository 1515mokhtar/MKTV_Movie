import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from 'next/navigation';

interface SeriesData {
  id: string; // Firebase Document ID, which is also the TMDB ID
}

interface DisplaySeriesData {
  id: string; // Firebase Document ID
  tmdb_id: number; // TMDB ID
  name: string; // Name from TMDB
  poster_path?: string | null; // Poster path from TMDB
}

// Function to fetch data from TMDB
async function fetchTmdbSeriesData(tmdbId: number) {
  const url = `https://api.themoviedb.org/3/tv/${tmdbId}?language=en-US`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN!, // Use environment variable for API key
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`Error fetching TMDB data for ID ${tmdbId}: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch TMDB data for ID ${tmdbId}:`, err);
    return null;
  }
}

export default async function SeriesDisponiblePage() {
  let firebaseSeriesIds: string[] = [];
  let displaySeries: DisplaySeriesData[] = [];
  let error: string | null = null;

  try {
    const seriesCollectionRef = collection(db, "series");
    const seriesSnapshot = await getDocs(seriesCollectionRef);

    if (seriesSnapshot.empty) {
      console.log("No series found in Firebase.");
    } else {
      // Get just the document IDs, which are the TMDB IDs
      firebaseSeriesIds = seriesSnapshot.docs.map(doc => doc.id);

      console.log("Fetched Firebase Series IDs (TMDB IDs):", firebaseSeriesIds);

      // Fetch TMDB data for each series
      for (const tmdbId of firebaseSeriesIds) {
        const tmdbData = await fetchTmdbSeriesData(parseInt(tmdbId));
        if (tmdbData) {
          displaySeries.push({
            id: tmdbId,
            tmdb_id: parseInt(tmdbId),
            name: tmdbData.name || tmdbData.title || 'Unnamed Series', // Use name or title from TMDB
            poster_path: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null, // Use TMDB poster path
          });
        } else {
          console.warn(`Firebase document with ID ${tmdbId} is missing tmdb_id.`);
          // Optionally add a placeholder to displaySeries even if tmdb_id is missing
           displaySeries.push({
             id: tmdbId,
             tmdb_id: undefined,
             name: 'Unnamed Series (TMDB ID missing)',
             poster_path: null,
           });
        }
      }
       console.log("Prepared Display Series Data:", displaySeries);
    }
  } catch (e: any) {
    console.error("Error fetching series data: ", e);
    error = "Failed to load series.";
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  // Basic layout to display the series list
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Series Disponible</h1>
      {
        displaySeries.length === 0 ? (
          <p>No series available in Firebase or TMDB data could not be fetched.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displaySeries.map((s) => (
              // Link to the series details page using the Firebase ID
              <Link key={s.id} href={`/series/${s.id}`} className="block">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                     {s.poster_path ? (
                       <Image
                         src={s.poster_path}
                         alt={s.name || 'Series poster'}
                         fill
                         style={{ objectFit: 'cover' }}
                         sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                       />
                     ) : (
                       <span className="text-sm text-muted-foreground">No Image</span>
                     )}
                  </div>
                  <div className="p-2">
                    <h2 className="text-sm font-semibold line-clamp-1">{s.name}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      }
    </div>
  );
} 