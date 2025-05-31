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
  id: string | number; // Adjust type based on your Firebase ID type
  episode_number?: number;
  name?: string;
  overview?: string;
  still_path?: string; // Episode image path
  urlepisode: string; // Video URL
  // Add other fields from your Firebase episode data
}

// --- Modified Fetch Function to fetch from Firebase or TMDB and store --- 
async function fetchAndStoreSeasonDetails(params: { id: string, seasonNumber: string }) {
  // Explicitly access params properties
  const seriesId = params.id; 
  const seasonNumber = params.seasonNumber;

  console.log("DEBUG: Inside fetchAndStoreSeasonDetails - Explicitly accessed Series ID:", seriesId, "Season Number:", seasonNumber);

  // *** Step 1: Attempt to fetch from Firebase ***
  console.log("Attempting to fetch season details from Firebase...");
  let seasonDataFromFirebase: SeasonData | null = null; 

  try {
    // Ensure Firebase db instance is available
    if (!db) { throw new Error("Firebase Firestore not initialized or accessible."); }
    
    // Reference to the season document in Firebase
    const seasonDocRef = doc(db, 'series', seriesId, 'seasons', seasonNumber);
    const seasonDocSnap = await getDoc(seasonDocRef);

    if (seasonDocSnap.exists()) {
      seasonDataFromFirebase = seasonDocSnap.data() as SeasonData; // Cast data to SeasonData interface
      // Fetch episodes subcollection
      const episodesCollectionRef = collection(seasonDocRef, 'episodes');
      const episodeDocsSnap = await getDocs(episodesCollectionRef);
      seasonDataFromFirebase.episodes = episodeDocsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as EpisodeData })); // Map episode data
      console.log("Successfully fetched season data from Firebase.", seasonDataFromFirebase);
    } else {
      console.log("Season document not found in Firebase.");
    }

  } catch (firebaseError) {
    console.error("Error fetching from Firebase:", firebaseError);
  }

  // *** Step 2: If not found in Firebase or incomplete, fetch from TMDB ***
  // Check if seasonDataFromFirebase is null OR if episodes is missing/empty
  if (seasonDataFromFirebase === null || !seasonDataFromFirebase.episodes || seasonDataFromFirebase.episodes.length === 0) {
    console.log("Season data not found in Firebase or incomplete. Fetching from TMDB...");
    const accessToken = process.env.TMDB_READ_ACCESS_TOKEN; 
    console.log("Using Access Token (first 5 chars) for TMDB:", accessToken ? accessToken.substring(0, 5) + "..." : "NOT CONFIGURED");

    if (!accessToken) {
      console.error("TMDB Read Access Token (TMDB_READ_ACCESS_TOKEN) is not configured. Cannot fetch from TMDB.");
      // If neither Firebase nor TMDB is available, trigger notFound
      notFound(); 
    }

    const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?language=en-US`;

    try {
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
        console.error("Error fetching season details from TMDB:", {
          status: res.status,
          statusText: res.statusText,
          errorData: errorData,
          requestUrl: url,
        });
        if (res.status === 404) {
          notFound(); // Series/Season not found on TMDB
        }
        throw new Error(`Failed to fetch season details from TMDB: ${res.status} ${res.statusText}`);
      }

      const tmdbData = await res.json();
      console.log("Successfully fetched season data from TMDB.", tmdbData);

      // *** Step 3: Process and Store in Firebase ***
      console.log("Processing and storing season data in Firebase...");
      
      try {
        // Ensure Firebase db instance is available
        if (!db) { throw new Error("Firebase Firestore not initialized or accessible."); }
        
        // Reference to the season document in Firebase
        const seasonDocRef = doc(db, 'series', seriesId, 'seasons', seasonNumber);
        
        // Data to save for the season document (optional)
        const seasonDataToSave = {
           id: tmdbData.id, // TMDB Season ID
           name: tmdbData.name,
           season_number: tmdbData.season_number,
           // Provide a default value for episode_count if it's null or undefined
           episode_count: tmdbData.episode_count ?? 0,
           overview: tmdbData.overview, // Save season overview
           poster_path: tmdbData.poster_path, // Save season poster path
         };
        
        // Save the season document (using merge: true)
         await setDoc(seasonDocRef, seasonDataToSave, { merge: true });
         console.log("Saved season document to Firebase.");
        
        // Reference to the episodes subcollection under the season document
        const episodesCollectionRef = collection(seasonDocRef, 'episodes');
        
        // Iterate through TMDB episodes and save each to Firebase
        for (const tmdbEpisode of tmdbData.episodes) {
          // Reference for the episode document (using TMDB episode ID as doc ID)
           const episodeDocRef = doc(episodesCollectionRef, tmdbEpisode.id.toString());
          
          // Data to save for the episode document
           const episodeDataToSave: EpisodeData = { // Type assertion
             id: tmdbEpisode.id, // TMDB Episode ID
             episode_number: tmdbEpisode.episode_number,
             name: tmdbEpisode.name,
             overview: tmdbEpisode.overview,
             still_path: tmdbEpisode.still_path, // Episode image path
             // Add other TMDB episode fields you need
             urlepisode: '', // Placeholder for the video URL
           };
          
          // Save the episode document (using merge: true)
           await setDoc(episodeDocRef, episodeDataToSave, { merge: true });
           console.log(`Saved Episode ${tmdbEpisode.episode_number} (${tmdbEpisode.id}) to Firebase.`);
        }
        
        console.log("Finished attempting to save season and episode data to Firebase.");

      } catch (firebaseWriteError) {
        console.error("Error saving to Firebase:", firebaseWriteError);
        // Decide how to handle write errors - might not need to prevent rendering
      }

      // Return the data fetched from TMDB (which is now also saved to Firebase)
      // Note: This returns the raw TMDB data structure. You might want to adjust 
      // this to return data in the SeasonData structure if you need consistency.
      return tmdbData; 

    } catch (tmdbFetchError) {
      console.error("Error during TMDB fetch or processing:", tmdbFetchError);
      // If TMDB fetch fails after Firebase attempt, trigger notFound
      notFound(); 
    }

  } else {
    // Return the data successfully fetched from Firebase
    console.log("Returning data from Firebase.", seasonDataFromFirebase);
    return seasonDataFromFirebase;
  }
}
// --- End Modified Fetch Function ---

export default async function SeasonPage({ params }: { params: { id: string, seasonNumber: string } }) {
  let seasonDetails;
  try {
    // Call the new fetch and store function
    seasonDetails = await fetchAndStoreSeasonDetails(params);
  } catch (error) {
    console.error("Error loading season details:", error);
    notFound(); // Show not found if fetching and storing fails
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
          <h1 className="text-4xl font-bold">{seasonDetails?.name || `Season ${params.seasonNumber}`}</h1>
          
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
                </div>
                
                {/* Episode Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{episode.name || `Episode ${episode.episode_number}`}</h3>
                  {episode.overview && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{episode.overview}</p>
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