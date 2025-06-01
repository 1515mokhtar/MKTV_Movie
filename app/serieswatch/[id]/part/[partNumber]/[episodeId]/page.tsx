import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star, Calendar, Clock } from "lucide-react";
import { Metadata } from 'next'; // Import Metadata

// Import Firestore functions
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
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

interface PartData {
  id: string;
  name?: string;
  part_number: number;
  overview?: string | null;
  poster_path?: string | null;
  air_date?: string | null;
}

// Function to generate metadata (page title)
export async function generateMetadata({ params }: { params: { id: string, partNumber: string, episodeId: string } }): Promise<Metadata> {
  const seriesId = params.id;
  const partNumber = params.partNumber;
  const episodeId = params.episodeId;

  let episodeName = "Episode Details";

  try {
     if (!db) { throw new Error("Firebase Firestore not initialized"); }

     // Find the part document by seriesId and partNumber to get the partId
     const partsCollectionRef = collection(db, 'series', seriesId, 'parts');
     const partQuery = query(partsCollectionRef, where('part_number', '==', parseInt(partNumber)));
     const partQuerySnapshot = await getDocs(partQuery);

     if (!partQuerySnapshot.empty) {
         const partDoc = partQuerySnapshot.docs[0];
         const partId = partDoc.id;

         // Fetch the specific episode details
         const episodeDocRef = doc(db, 'series', seriesId, 'parts', partId, 'episodes', episodeId);
         const episodeDocSnap = await getDoc(episodeDocRef);

         if (episodeDocSnap.exists()) {
           const episodeData = episodeDocSnap.data() as EpisodeData;
           episodeName = `Episode ${episodeData.episode_number}: ${episodeData.name || 'Untitled'} - Part ${partNumber}`;
         }
     }

  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {
    title: episodeName,
  };
}

export default async function EpisodeWatchPage({ params }: { params: { id: string, partNumber: string, episodeId: string } }) {
  const seriesId = params.id;
  const partNumber = params.partNumber;
  const episodeId = params.episodeId;

   try {
      if (!db) { throw new Error("Firebase Firestore not initialized"); }

      // 1. Find the part document by seriesId and partNumber to get the partId
      const partsCollectionRef = collection(db, 'series', seriesId, 'parts');
      const partQuery = query(partsCollectionRef, where('part_number', '==', parseInt(partNumber)));
      const partQuerySnapshot = await getDocs(partQuery);

      if (partQuerySnapshot.empty) {
          console.error(`Part with number ${partNumber} not found for series ID: ${seriesId}`);
          notFound(); // Use standard notFound for part not found
      }

      // Assuming only one document matches
      const partDoc = partQuerySnapshot.docs[0];
      const partId = partDoc.id;
      const partDetails = { id: partDoc.id, ...partDoc.data() as PartData };

      // 2. Fetch the specific episode details using the found partId and episodeId
      const episodeDocRef = doc(db, 'series', seriesId, 'parts', partId, 'episodes', episodeId);
      const episodeDocSnap = await getDoc(episodeDocRef);

      if (!episodeDocSnap.exists()) {
        console.error(`Episode ${episodeId} not found in Firebase under part ${partId}.`);
        notFound(); // Use standard notFound for episode not found
      }
      const episodeDetails = { id: episodeDocSnap.id, ...episodeDocSnap.data() as EpisodeData };

      // --- Check if url_video is null ---
      if (!episodeDetails.url_video) {
          console.log(`url_video is null for episode ${episodeId}. Displaying video not available message.`);
          // Return a custom component or JSX for video not available
          return (
              <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                  <h2 className="text-3xl font-bold mb-4">Video Not Available Yet</h2>
                  <p className="text-xl mb-8 text-muted-foreground">We are working to add this episode's video as quickly as possible.</p>
                  <Link href={`/series/${seriesId}/part/${partNumber}`} passHref>
                      <button className="bg-mktv-accent hover:bg-mktv-accent-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                          Back to Part {partNumber}
                      </button>
                  </Link>
              </div>
          );
      }
      // --- End Check --- 

      // 3. Fetch all episodes for this part using the found partId (only if video is available)
      const episodesCollectionRef = collection(db, 'series', seriesId, 'parts', partId, 'episodes');
      const allEpisodesDocsSnap = await getDocs(episodesCollectionRef);
      const allEpisodes = allEpisodesDocsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as EpisodeData }));

      // Sort episodes by episode_number
      allEpisodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));

      // Now, render the full watch page since url_video is available
      return (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Back button */}
          <Link href={`/series/${seriesId}/part/${partNumber}`} className="inline-flex items-center text-mktv-accent hover:text-mktv-accent-dark transition-colors">
             <ChevronLeft className="w-4 h-4 mr-2" />
             Back to Part {partNumber}
          </Link>

          {/* Episode Watch Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video Player Area (iframe) */}
            <div className="w-full lg:w-3/4 aspect-video bg-gray-800 rounded-lg overflow-hidden">
               {/* Use episodeDetails.url_video here to load your video player */}
               <iframe
                 src={episodeDetails.url_video}
                 title={episodeDetails.name || `Episode ${episodeDetails.episode_number}`}
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                 allowFullScreen
                 className="w-full h-full"
                 frameBorder="0"
               ></iframe>
            </div>

            {/* Current Episode Details */}
            <div className="w-full lg:w-1/4 space-y-4">
                <h1 className="text-2xl font-bold line-clamp-2">{episodeDetails.name || `Episode ${episodeDetails.episode_number}`}</h1>
                <p className="text-lg text-muted-foreground">Part {partNumber} - Episode {episodeDetails.episode_number}</p>

                {episodeDetails.overview && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Overview</h2>
                        <p className="text-base text-muted-foreground leading-relaxed">{episodeDetails.overview}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {episodeDetails.air_date && ( // Check if air_date is not null or undefined
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{episodeDetails.air_date ? new Date(episodeDetails.air_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    )}
                    {episodeDetails.runtime && episodeDetails.runtime > 0 && ( // Check if runtime is not null/undefined and greater than 0
                         <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{episodeDetails.runtime}m</span>
                         </div>
                    )}
                     {episodeDetails.vote_average && episodeDetails.vote_average > 0 && ( // Check if vote_average is not null/undefined and greater than 0
                         <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>{episodeDetails.vote_average.toFixed(1)}</span>
                         </div>
                     )}
                </div>
            </div>
          </div>

          {/* Episodes List Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Episodes in Part {partNumber}</h2>
            <div className="space-y-4">
              {allEpisodes.map((episode) => (
                <Link 
                  key={episode.id} 
                  href={`/serieswatch/${seriesId}/part/${partNumber}/${episode.id}`}
                  className={
                    `flex items-center gap-4 p-4 rounded-lg transition-colors 
                    ${episode.id === episodeId ? 'bg-mktv-accent/20 text-mktv-accent ring-2 ring-mktv-accent' : 'bg-gray-900 hover:bg-gray-800'}`
                  }
                >
                   {/* Episode Thumbnail */}
                    <div className="aspect-video w-24 relative overflow-hidden rounded-md">
                      {episode.still_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                          alt={`Episode ${episode.episode_number}: ${episode.name}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                  
                  <div>
                    <p className="font-semibold text-lg">{episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}</p>
                    {episode.overview && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{episode.overview}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      );

   } catch (error) {
      console.error("Error fetching watch details (by part number) from Firebase:", error);
      notFound(); // Use standard notFound for any other fetching errors
   }
} 