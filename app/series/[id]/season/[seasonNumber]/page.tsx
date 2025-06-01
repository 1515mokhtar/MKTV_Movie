import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// *** Uncomment and configure your actual Firebase setup or import db from your setup file ***
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore'; // Keep getFirestore if initializing here
// Commented out the full import list as we'll import selectively
// import { getFirestore, doc, getDoc, collection, getDocs, setDoc, query, where } from 'firebase/firestore';

// Import specific Firestore functions needed
import { doc, getDoc, collection, getDocs, setDoc, query, where } from 'firebase/firestore';

// const firebaseConfig = { /* Your Firebase config */ };
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app); // Ensure db is initialized and accessible

// Import the initialized db instance from your Firebase config file (ADJUST THE PATH)
// Corrected import path to point to lib/firebase.ts
import { db } from '@/lib/firebase'; 

// Removed declare const db line as db is now imported
// declare const db: getFirestore.Firestore; // Declare db if it's initialized externally

// Define an interface for the season data structure
interface SeasonData {
  id: string | number; // Adjust type based on your Firebase ID type
  name?: string; // Optional fields
  season_number?: number;
  episode_count?: number;
  overview?: string; // Added season overview
  poster_path?: string; // Added season poster path
  episodes: EpisodeData[]; // Use EpisodeData interface for episodes
  // Add other fields from your Firebase season data
}

// Define an interface for the episode data structure
interface EpisodeData {
  id: string | number;
  episode_number?: number;
  name?: string;
  overview?: string;
  still_path?: string;
  urlepisode: string;
  air_date?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
}

// --- Modified Fetch Function to fetch from Firebase or TMDB and store --- 
async function fetchAndStoreSeasonDetails(params: { id: string, seasonNumber: string }) {
  const seriesId = params.id;
  const seasonNumber = params.seasonNumber;

  console.log("DEBUG: Inside fetchAndStoreSeasonDetails - Series ID:", seriesId, "Season Number:", seasonNumber);

  // First, try to get episode groups
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY_V3;
  if (!apiKey) {
    throw new Error("TMDB API key not configured");
  }

  // Get episode groups
  const episodeGroupsUrl = `https://api.themoviedb.org/3/tv/${seriesId}/episode_groups?api_key=${apiKey}`;
  const episodeGroupsRes = await fetch(episodeGroupsUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  let episodeGroup = null;
  if (episodeGroupsRes.ok) {
    const episodeGroupsData = await episodeGroupsRes.json();
    // Find the episode group that matches our season number
    episodeGroup = episodeGroupsData.results.find((group: any) => 
      group.name.toLowerCase().includes(`part ${seasonNumber}`) || 
      group.name.toLowerCase().includes(`season ${seasonNumber}`)
    );
  }

  // If we found an episode group, use it to get the episodes
  if (episodeGroup) {
    const groupUrl = `https://api.themoviedb.org/3/tv/episode_group/${episodeGroup.id}?api_key=${apiKey}`;
    const groupRes = await fetch(groupUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (groupRes.ok) {
      const groupData = await groupRes.json();
      
      // Get the series details to get the poster path
      const seriesUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`;
      const seriesRes = await fetch(seriesUrl);
      const seriesData = await seriesRes.json();

      // Transform the group data into our expected format
      const episodes = groupData.episodes.map((ep: any) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path,
        urlepisode: '',
        air_date: ep.air_date,
        vote_average: ep.vote_average,
        vote_count: ep.vote_count,
        runtime: ep.runtime
      }));

      return {
        id: episodeGroup.id,
        name: episodeGroup.name,
        season_number: parseInt(seasonNumber),
        episode_count: episodes.length,
        overview: groupData.overview || seriesData.overview || '',
        poster_path: seriesData.poster_path, // Use series poster if no specific part poster
        episodes: episodes,
        air_date: groupData.air_date,
        is_episode_group: true
      };
    }
  }

  // If no episode group found or failed to fetch, fall back to regular season data
  const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${apiKey}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch season details: ${res.status} ${res.statusText}`);
  }

  const seasonData = await res.json();
  return {
    ...seasonData,
    episodes: seasonData.episodes.map((ep: any) => ({
      ...ep,
      urlepisode: '',
    })),
    is_episode_group: false
  };
}
// --- End Modified Fetch Function ---

export default async function SeasonPage({ params }: { params: { id: string, seasonNumber: string } }) {
  let seasonDetails;
  try {
    seasonDetails = await fetchAndStoreSeasonDetails(params);
  } catch (error) {
    console.error("Error loading season details:", error);
    notFound();
  }

  const episodes = seasonDetails?.episodes || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <Link href={`/series/${params.id}`} className="inline-flex items-center text-mktv-accent hover:text-mktv-accent-dark transition-colors">
         <ChevronLeft className="w-4 h-4 mr-2" />
         Back to Series Details
      </Link>

      {/* Season Header Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Season Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg shadow-lg">
            {seasonDetails?.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${seasonDetails.poster_path}`}
                alt={seasonDetails?.name || `Season ${params.seasonNumber}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400">No poster available</span>
              </div>
            )}
          </div>
        </div>

        {/* Season Info */}
        <div className="w-full md:w-2/3 lg:w-3/4 space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{seasonDetails?.name || `Season ${params.seasonNumber}`}</h1>
            {seasonDetails?.is_episode_group && (
              <span className="bg-mktv-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                Part {params.seasonNumber}
              </span>
            )}
          </div>
          
          {/* Only show episode count if greater than 0 */}
          {seasonDetails?.episode_count > 0 && (
            <p className="text-lg text-mktv-accent">{seasonDetails.episode_count} episodes</p>
          )}
          
          {seasonDetails?.overview && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-8">{seasonDetails.overview}</p>
            </div>
          )}

          {seasonDetails?.air_date && (
            <p className="text-sm text-muted-foreground">
              Air Date: {new Date(seasonDetails.air_date).toLocaleDateString()}
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
              href={`/serieswatch/${params.id}/${params.seasonNumber}/${episode.id}`}
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