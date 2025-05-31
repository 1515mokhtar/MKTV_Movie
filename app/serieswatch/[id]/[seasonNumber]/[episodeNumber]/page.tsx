"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'; // Import necessary Firestore functions
import { db } from '@/lib/firebase'; // Assuming your Firebase instance is exported as `db`

// Define interfaces for data structures
interface EpisodeDetails {
  id: string; // Firebase document ID
  seriesId: string;
  seasonNumber: string; // Store as string to match URL param
  episodeNumber?: number; // Episode number from Firebase/TMDB (optional)
  name?: string; // Episode name
  overview?: string; // Episode overview
  still_path?: string; // Episode image path
  urlepisode: string; // Video URL for the episode
  // Add other fields you might need from your episode document
}

// Function to fetch episode details from Firebase
async function fetchEpisodeDetailsFromFirebase(
  seriesId: string,
  seasonNumber: string,
  episodeId: string // Now using episodeId
): Promise<EpisodeDetails | null> {
  try {
    // Ensure Firebase db instance is available
    if (!db) { 
      throw new Error("Firebase Firestore not initialized or accessible.");
    }

    // Reference to the specific episode document in Firebase
    const episodeDocRef = doc(db, 'series', seriesId, 'seasons', seasonNumber, 'episodes', episodeId);
    
    const episodeDocSnap = await getDoc(episodeDocRef);

    if (episodeDocSnap.exists()) {
      const data = episodeDocSnap.data() as EpisodeDetails; // Cast data
      // Combine doc.id with data for the EpisodeDetails object
      const episodeDetails = { ...data, id: episodeDocSnap.id };
      return episodeDetails;
    } else {
      return null; // Return null if document not found
    }

  } catch (error) {
    return null; // Return null on error
  }
}

export default function SeriesWatchPage({
  params,
}: { params: { id: string; seasonNumber: string; episodeNumber: string } }) { // episodeNumber param actually contains the episodeId
  const router = useRouter();
  // Destructure params, renaming episodeNumber to episodeId for clarity
  const { id: seriesId, seasonNumber, episodeNumber: episodeId } = params; 

  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // State for season and episode selection UI (placeholders)
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber);
  // Use episodeId initially for selected episode state
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(episodeId); 
  const [seasons, setSeasons] = useState<string[]>([]); // Use string[] for season numbers
  // Store episodes with their IDs and numbers for the selection UI
  const [episodesInSeason, setEpisodesInSeason] = useState<{ id: string, episode_number?: number, name?: string }[]>([]); 

  // Move fetchEpisodesInSeason to the top level of the component
  const fetchEpisodesInSeason = async (currentSeasonNumber: string) => {
    try {
      if (!db) throw new Error("Firebase Firestore not initialized.");
      const episodesCollectionRef = collection(db, 'series', seriesId, 'seasons', currentSeasonNumber, 'episodes');
      const snapshot = await getDocs(episodesCollectionRef);
      const episodesData = snapshot.docs.map(doc => ({
        id: doc.id,
        seasonNumber: currentSeasonNumber,
        ...doc.data() as { episode_number?: number, name?: string }
      }));
      setEpisodesInSeason(episodesData);
    } catch (error) {
    }
  };

  useEffect(() => {
    const getEpisodeData = async () => {
      setLoading(true);
      setError(null);

      // Fetch episode details from Firebase using the seriesId, seasonNumber, and episodeId
      const details = await fetchEpisodeDetailsFromFirebase(seriesId, seasonNumber, episodeId);

      if (details) {
        setEpisodeDetails(details);
        setVideoUrl(details.urlepisode); // This should trigger iframe update if URL changes
      } else {
        setError("Could not fetch episode details.");
        setVideoUrl(null);
      }
      setLoading(false);
    };

    getEpisodeData();
    // Depend on episodeId to re-fetch when a new episode is selected via URL
  }, [seriesId, seasonNumber, episodeId]); 

  // useEffect to fetch seasons and episodes for selection UI from Firebase
  useEffect(() => {
    // Fetch all season numbers for the series from Firebase
    const fetchSeasons = async () => {
      try {
        if (!db) throw new Error("Firebase Firestore not initialized.");
        const seasonsCollectionRef = collection(db, 'series', seriesId, 'seasons');
        const snapshot = await getDocs(seasonsCollectionRef);
        const seasonNumbers = snapshot.docs.map(doc => doc.id); // Assuming season number is the doc ID
        setSeasons(seasonNumbers);
      } catch (error) {
      }
    };

    // Ensure useEffect is triggered when selectedSeason changes
    if (seriesId) {
      fetchSeasons();
      fetchEpisodesInSeason(selectedSeason);
    }

  }, [seriesId, selectedSeason]);

  const handleSeasonSelect = async (season: string) => {
    setSelectedSeason(season);
    
    // Fetch episodes for the selected season
    try {
      if (!db) throw new Error("Firebase Firestore not initialized.");
      const episodesCollectionRef = collection(db, 'series', seriesId, 'seasons', season, 'episodes');
      const snapshot = await getDocs(episodesCollectionRef);
      const episodesData = snapshot.docs.map(doc => ({
        id: doc.id,
        seasonNumber: season,
        ...doc.data() as { episode_number?: number, name?: string }
      }));
      
      setEpisodesInSeason(episodesData);
      
      // If we have episodes, redirect to the first one
      if (episodesData.length > 0) {
        const firstEpisode = episodesData[0];
        router.push(`/serieswatch/${seriesId}/${season}/${firstEpisode.id}`);
      }
    } catch (error) {
    }
  };

  const handleEpisodeSelect = (episodeIdToSelect: string) => {
    setSelectedEpisodeId(episodeIdToSelect); // Update selected episode state with ID
    // Redirect to the new episode URL using the selected episode's ID
    router.push(`/serieswatch/${seriesId}/${seasonNumber}/${episodeIdToSelect}`); 
  };

  // Update the redirection logic to handle initial load and season selection
  useEffect(() => {
    if (!episodeId && episodesInSeason.length > 0) {
      const firstEpisode = episodesInSeason.find(episode => episode.episode_number === 0);
      if (firstEpisode) {
        router.push(`/serieswatch/${seriesId}/${selectedSeason}/${firstEpisode.id}`);
      }
    }
  }, [episodeId, episodesInSeason, seriesId, selectedSeason, router]);

  if (loading) {
    return <div>Loading episode...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!episodeDetails || !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="text-3xl font-bold text-mktv-accent mb-2">Episode Not Available</div>
        <div className="text-lg text-muted-foreground mb-4">
          The details or video for this episode are not available yet.<br />
          We'll add this episode as soon as possible!
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-full bg-mktv-accent text-white font-semibold hover:bg-mktv-accent-dark transition-colors"
        >
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Back button */}
      <button onClick={() => router.back()} className="text-mktv-accent hover:text-mktv-accent-dark font-semibold flex items-center mb-4">
        &larr; Back
      </button>

      {/* Episode Title */}
      <h1 className="text-2xl font-bold mb-4">{episodeDetails.name || 'Episode'}</h1>

      {/* Video Player Section (using iframe) */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-8">
        <iframe
          src={videoUrl}
          width="100%"
          height="100%"
          allowFullScreen
          // Consider adding sandbox attributes for security
          // sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>

      {/* Season Selection UI (Horizontal List/Scroll) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Seasons</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {seasons.map(season => (
            <button 
              key={season} 
              onClick={() => handleSeasonSelect(season)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${selectedSeason === season ? 'bg-mktv-accent text-white' : 'bg-gray-800 text-white hover:bg-mktv-accent hover:text-white'}`}
            >
              Season {season}
            </button>
          ))}
        </div>
      </div>

      {/* Episode Selection UI (Horizontal List/Scroll) */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Episodes (Season {selectedSeason})</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
           {episodesInSeason.map(episode => (
            <button 
              key={episode.id} // Use episode.id as the key
              onClick={() => handleEpisodeSelect(episode.id)} // Pass episode.id to handler
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${selectedEpisodeId === episode.id ? 'bg-mktv-accent text-white' : 'bg-gray-800 text-white hover:bg-mktv-accent hover:text-white'}`}
            >
              {/* Display episode number or name */}
              {episode.episode_number ? `E${episode.episode_number}` : episode.name || 'Episode'}
            </button>
          ))}
        </div>
      </div>

      {/* Optional: Display episode overview */}
      {episodeDetails.overview && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Overview</h2>
          <p className="text-muted-foreground">{episodeDetails.overview}</p>
        </div>
      )}
    </div>
  );
} 