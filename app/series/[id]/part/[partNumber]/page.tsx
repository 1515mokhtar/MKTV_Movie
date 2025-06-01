import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Import Firestore functions
import { doc, setDoc, collection } from 'firebase/firestore';
// Import the initialized db instance from your Firebase config file
import { db } from '@/lib/firebase'; 

interface EpisodeData {
  id: string | number;
  episode_number?: number;
  name?: string;
  overview?: string;
  still_path?: string;
  url_video: string | null;
  air_date?: string | null;
  vote_average?: number;
  vote_count?: number;
  runtime?: number | null;
}

async function fetchPartDetails(params: { id: string, partNumber: string }) {
  const seriesId = params.id;
  const partNumber = params.partNumber;

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY_V3;
  if (!apiKey) throw new Error("TMDB API key not configured");

  // 1. Get episode groups from TMDB
  const episodeGroupsUrl = `https://api.themoviedb.org/3/tv/${seriesId}/episode_groups?api_key=${apiKey}`;
  const episodeGroupsRes = await fetch(episodeGroupsUrl);
  if (!episodeGroupsRes.ok) {
    console.error("Failed to fetch episode groups from TMDB");
    notFound(); // Or handle differently if you have cached data
  }
  const episodeGroupsData = await episodeGroupsRes.json();

  // 2. Find the group named "Parts (edited version)"
  const partsGroup = episodeGroupsData.results.find(
    (group: any) => group.name === "Parts (edited version)"
  );
  if (!partsGroup) {
     console.error(`"Parts (edited version)" group not found for series ID: ${seriesId}`);
     notFound();
  }

  // 3. Fetch the details for this group
  const groupUrl = `https://api.themoviedb.org/3/tv/episode_group/${partsGroup.id}?api_key=${apiKey}`;
  const groupRes = await fetch(groupUrl);
  if (!groupRes.ok) {
    console.error("Failed to fetch episode group details from TMDB");
    notFound(); // Or handle differently
  }
  const groupData = await groupRes.json();

  // 4. Find the correct subgroup for the part number
  const partSubgroup = groupData.groups.find(
    (sub: any) => sub.name.endsWith(`Part ${partNumber}`)
  );
  if (!partSubgroup) {
     console.error(`Part subgroup "Part ${partNumber}" not found in group "Parts (edited version)" for series ID: ${seriesId}`);
     notFound();
  }

  // 5. Get the episodes for this part and prepare for saving
  const episodes = partSubgroup.episodes.map((ep: any) => ({
    id: ep.id.toString(), // Ensure ID is string for Firestore doc ID
    episode_number: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    still_path: ep.still_path,
    url_video: null, // Initialize as null as requested
    air_date: ep.air_date || null, // Handle potential nulls
    vote_average: ep.vote_average || 0,
    vote_count: ep.vote_count || 0,
    runtime: ep.runtime || null // Handle potential nulls and allow null
  }));

  // 6. Get series details for fallback poster
  const seriesUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`;
  const seriesRes = await fetch(seriesUrl);
  const seriesData = await seriesRes.json();

  // 7. Use subgroup poster, else group, else series
  const poster_path = partSubgroup.poster_path || groupData.poster_path || seriesData.poster_path;

  // Prepare part data for saving
  const partDataToSave = {
    id: partSubgroup.id.toString(), // Ensure ID is string
    name: partSubgroup.name,
    part_number: parseInt(partNumber),
    episode_count: episodes.length,
    overview: partSubgroup.overview || groupData.overview || seriesData.overview || '',
    poster_path: poster_path,
    air_date: partSubgroup.air_date || null,
    // You can add other part-level data from TMDB here if needed
  };

  // 8. Save data to Firebase
  try {
    // Ensure db is initialized
    if (!db) { throw new Error("Firebase Firestore not initialized"); }

    // Reference to the part document
    const partDocRef = doc(db, 'series', seriesId, 'parts', partDataToSave.id);

    // Save the part data
    await setDoc(partDocRef, partDataToSave, { merge: true });
    console.log(`Part ${partNumber} details saved to Firebase.`);

    // Reference to the episodes subcollection under the part document
    const episodesCollectionRef = collection(partDocRef, 'episodes');

    // Save each episode data
    for (const episode of episodes) {
      const episodeDocRef = doc(episodesCollectionRef, episode.id);
      await setDoc(episodeDocRef, episode, { merge: true });
      console.log(`Episode ${episode.episode_number} of Part ${partNumber} saved to Firebase.`);
    }
    console.log(`Finished saving all episodes for Part ${partNumber}.`);

  } catch (firebaseError) {
    console.error("Error saving part data to Firebase:", firebaseError);
    // Decide how to handle Firebase write errors (e.g., log, show a message)
    // The page should still render with TMDB data even if saving fails
  }

  // Return the data fetched from TMDB (and potentially saved to Firebase)
  return {
    ...partDataToSave, // Return the prepared data including the determined poster_path
    episodes: episodes, // Return the episodes list
  };
}

export default async function PartPage({ params }: { params: { id: string, partNumber: string } }) {
  let partDetails;
  try {
    partDetails = await fetchPartDetails(params);
  } catch (error) {
    console.error("Error loading or saving part details:", error);
    notFound(); // Still show not found if fetching from TMDB fails
  }

  const episodes = partDetails?.episodes || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <Link href={`/series/${params.id}`} className="inline-flex items-center text-mktv-accent hover:text-mktv-accent-dark transition-colors">
         <ChevronLeft className="w-4 h-4 mr-2" />
         Back to Series Details
      </Link>

      {/* Part Header Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Part Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg shadow-lg">
            {partDetails?.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${partDetails.poster_path}`}
                alt={partDetails?.name || `Part ${params.partNumber}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
        </div>

        {/* Part Info */}
        <div className="w-full md:w-2/3 lg:w-3/4 space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{partDetails?.name}</h1>
            <span className="bg-mktv-accent text-white px-3 py-1 rounded-full text-sm font-medium">
              Part {params.partNumber}
            </span>
          </div>
          
          {partDetails?.episode_count > 0 && (
            <p className="text-lg text-mktv-accent">{partDetails.episode_count} episodes</p>
          )}
          
          {partDetails?.overview && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8">{partDetails.overview}</p>
            </div>
          )}

          {partDetails?.air_date && (
            <p className="text-sm text-muted-foreground">
              Air Date: {new Date(partDetails.air_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Episodes Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Episodes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {episodes.map((episode: EpisodeData) => (
            <Link 
              key={episode.id} 
              href={`/serieswatch/${params.id}/part/${params.partNumber}/${episode.id}`}
              className="group"
            >
              <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-[1.02] group-hover:ring-2 group-hover:ring-mktv-accent">
                {/* Episode Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  {episode.still_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                      alt={`Episode ${episode.episode_number}: ${episode.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  
                  {/* Episode Number Badge */}
                  <div className="absolute top-2 left-2 bg-mktv-accent text-white px-2 py-1 rounded text-sm font-medium">
                    Episode {episode.episode_number}
                  </div>

                  {/* Episode Rating */}
                  {episode.vote_average && episode.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                      ★ {episode.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>
                
                {/* Episode Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{episode.name || `Episode ${episode.episode_number}`}</h3>
                  {episode.air_date && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(episode.air_date).toLocaleDateString()}
                    </p>
                  )}
                  {episode.overview && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{episode.overview}</p>
                  )}
                  {episode.runtime && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {episode.runtime} minutes
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 