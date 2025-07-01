"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot, where, writeBatch, updateDoc, serverTimestamp, runTransaction, Timestamp, FieldValue } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { SeriesCard } from "@/components/series-card";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { SeriesFilters } from "@/components/series-filters";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslation } from "react-i18next";

interface TmdbSeriesData {
  id: number;
  name: string;
  poster_path?: string;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
  vote_average?: number;
  backdrop_path?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  episode_run_time?: number[];
  popularity?: number;
  vote_count?: number;
  last_air_date?: string;
  seasons?: TmdbSeason[];
  episode_groups?: TmdbEpisodeGroupResult;
}

interface TmdbSeason {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

interface TmdbEpisodeGroupResult {
  results: TmdbEpisodeGroup[];
}

interface TmdbEpisodeGroup {
  id: string;
  name: string;
  order: number;
  type: number;
  episode_count: number;
  group_count: number;
}

interface FirebaseSeries extends TmdbSeriesData {
  firebaseId: string;
  name_lowercase?: string;
  last_updated?: Timestamp | FieldValue;
  genres: { id: number; name: string }[];
  seasons?: TmdbSeason[];
  episode_groups?: TmdbEpisodeGroupResult;
  status?: string;
}

interface FirebaseSeason {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

interface FirebaseEpisodeGroup {
  id: string;
  name: string;
  type: number;
  episode_count: number;
  group_count: number;
}

export default function SeriesDisponiblePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSeries, setTotalSeries] = useState(0);
  const [processedSeries, setProcessedSeries] = useState(0);
  const [series, setSeries] = useState<FirebaseSeries[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const ITEMS_PER_PAGE = 20;

  // New state for filters
  const [selectedGenre, setSelectedGenre] = useState<string>('all'); // State to hold selected genre ID (as string)
  const [selectedYear, setSelectedYear] = useState<string>('all'); // State to hold selected year
  const [selectedSort, setSelectedSort] = useState<string>('first_air_date_desc'); // State to hold selected sort option

  const [genresList, setGenresList] = useState<{ id: number; name: string }[]>([]);
  const [debugSeries, setDebugSeries] = useState<any[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const currentLang = i18n.language;

  // Function to fetch and store genres
  const fetchAndStoreGenres = async () => {
    try {
      console.log("Attempting to fetch genres from TMDB...");
      const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list?language=${currentLang}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        });
      const data = await response.json();
      
      console.log("Successfully fetched genres from TMDB:", data.genres);
      
      // Create a batch write
      const batch = writeBatch(db);
      const genresCollection = collection(db, "genres");

      // Store each genre in Firebase
      for (const genre of data.genres) {
        const genreDoc = doc(genresCollection, genre.id.toString());
        batch.set(genreDoc, {
          id: genre.id,
          name: genre.name ?? '', // Ensure name is always stored as a string
          last_updated: new Date().toISOString()
        });
      }

      // Commit the batch
      await batch.commit();
      console.log("Genres successfully stored in Firebase.");
      
      // No need to setGenresList here, as loadGenres will re-fetch after storing
      toast.success("Genres updated successfully!");
    } catch (error) {
      console.error("Error in fetchAndStoreGenres function:", error);
      toast.error("Failed to update genres");
    }
  };

  // Load genres from Firebase on component mount and when language changes
  useEffect(() => {
    const loadGenres = async () => {
      try {
        console.log("Loading genres from Firebase...");
        const genresCollection = collection(db, "genres");
        const genresSnapshot = await getDocs(genresCollection);
        
        if (genresSnapshot.empty) {
          console.log("No genres found in Firebase, attempting to fetch from TMDB and store...");
          // If no genres exist, fetch and store them
          await fetchAndStoreGenres();
          // After storing, re-fetch to ensure the latest data is loaded
          const updatedGenresSnapshot = await getDocs(genresCollection);
          const genres = updatedGenresSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: data.id,
              name: data.name ?? '' // Ensure name is always a string
            };
          });
          // Sort genres by name for better UX
          genres.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
          console.log("Genres loaded after initial fetch and store:", genres);
          setGenresList(genres);

        } else {
          console.log("Found genres in Firebase:", genresSnapshot.size);
          // Load genres from Firebase
          const genres = genresSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: data.id,
              name: data.name ?? '' // Ensure name is always a string
            };
          });
          // Sort genres by name for better UX
          genres.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
          console.log("Loaded genres from Firebase:", genres);
          setGenresList(genres);
        }
      } catch (error) {
        console.error("Error in loadGenres function:", error);
        toast.error("Failed to load genres");
      }
    };

    loadGenres();
  }, [i18n.language]);

  // Load some debug series to see what's in the database
  useEffect(() => {
    const loadDebugSeries = async () => {
      try {
        const seriesQuery = collection(db, "series");
        const debugSnapshot = await getDocs(query(seriesQuery, limit(5)));
        const debugData = debugSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            genre_ids: data.genre_ids || [],
            genres: data.genres || []
          };
        });
        setDebugSeries(debugData);
        console.log("Debug series loaded:", debugData);
      } catch (error) {
        console.error("Error loading debug series:", error);
      }
    };
    
    loadDebugSeries();
  }, []);

  // Log genresList whenever it changes for debugging
  useEffect(() => {
    console.log("Current genresList state (after set):", genresList);
  }, [genresList]);

  // Refetch series when filters or page change
  useEffect(() => {
    // Always fetch from first page if filters change
    fetchSeriesFromFirebase(currentPage, selectedGenre, selectedYear, selectedSort, searchQuery);
  }, [currentPage, selectedGenre, selectedYear, selectedSort, searchQuery]);

  // Function to fetch series from Firebase with pagination and filters
  const fetchSeriesFromFirebase = async (page: number, genre: string, year: string, sort: string, search: string) => {
    console.log("fetchSeriesFromFirebase called with params:", { page, genre, year, sort, search });
    setIsLoadingSeries(true);
    try {
      let seriesQuery = collection(db, "series");
      let queryConstraints: any[] = [];

      // Apply genre filter - use a different approach to avoid composite index issues
      if (genre && genre !== 'all') {
        const genreId = parseInt(genre);
        if (!isNaN(genreId)) {
          // Use array-contains-any for better compatibility
          queryConstraints.push(where("genre_ids", "array-contains-any", [genreId]));
          console.log(`Filtering by genre ID: ${genreId}`);
        } else {
          console.error(`Invalid genre ID: ${genre}`);
        }
      }

      // Apply year filter
      if (year !== "all") {
        console.log("Applying year filter for:", year);
        queryConstraints.push(where("first_air_date", ">=", `${year}-01-01`));
        queryConstraints.push(where("first_air_date", "<=", `${year}-12-31`));
      }
      
      // Apply search (partial match)
      if (search) {
        const searchLower = search.toLowerCase();
        queryConstraints.push(where("name_lowercase", ">=", searchLower));
        queryConstraints.push(where("name_lowercase", "<=", searchLower + "\uf8ff"));
      }

      console.log("Query Constraints after filters (before sorting/pagination):", queryConstraints);

      // Apply sorting - only use simple sorting to avoid composite index issues
      let sortField = "first_air_date";
      let sortDirection: "desc" | "asc" = "desc";
      
      switch (sort) {
        case "first_air_date_desc":
          sortField = "first_air_date";
          sortDirection = "desc";
          break;
        case "first_air_date_asc":
          sortField = "first_air_date";
          sortDirection = "asc";
          break;
        case "vote_average_desc":
          sortField = "vote_average";
          sortDirection = "desc";
          break;
        case "popularity_desc":
          sortField = "popularity";
          sortDirection = "desc";
          break;
        case "name_asc":
          sortField = "name";
          sortDirection = "asc";
          break;
        default:
          sortField = "first_air_date";
          sortDirection = "desc";
          break;
      }

      // If we have genre filter, try without sorting first to avoid composite index issues
      if (genre && genre !== 'all') {
        try {
          console.log("Attempting query with genre filter but without sorting...");
          // Reset query constraints for genre-only query
          const genreConstraints = [];
          const genreId = parseInt(genre);
          if (!isNaN(genreId)) {
            genreConstraints.push(where("genre_ids", "array-contains-any", [genreId]));
            console.log(`Genre filter: looking for genre_id ${genreId}`);
          }
          
          const genreQuery = query(seriesQuery, ...genreConstraints, limit(100)); // Get more items to sort in memory
          const genreSnapshot = await getDocs(genreQuery);
          const genreData: FirebaseSeries[] = [];
          
          console.log(`Genre query returned ${genreSnapshot.size} documents`);
          
          genreSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`Series ${data.name} has genre_ids:`, data.genre_ids);
            genreData.push({
              id: data.id,
              name: data.name,
              poster_path: data.poster_path,
              vote_average: data.vote_average,
              overview: data.overview,
              backdrop_path: data.backdrop_path,
              first_air_date: data.first_air_date,
              genres: data.genres || [],
              genre_ids: data.genre_ids || [],
              episode_run_time: data.episode_run_time || [],
              number_of_seasons: data.number_of_seasons,
              number_of_episodes: data.number_of_episodes,
              vote_count: data.vote_count,
              popularity: data.popularity,
              name_lowercase: data.name_lowercase,
              last_updated: data.last_updated,
              status: data.status,
              seasons: data.seasons || [],
              firebaseId: doc.id,
              episode_groups: data.episode_groups,
            });
          });

          // Sort in memory
          genreData.sort((a, b) => {
            switch (sort) {
              case "first_air_date_desc":
                return new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime();
              case "first_air_date_asc":
                return new Date(a.first_air_date).getTime() - new Date(b.first_air_date).getTime();
              case "vote_average_desc":
                return (b.vote_average || 0) - (a.vote_average || 0);
              case "popularity_desc":
                return (b.popularity || 0) - (a.popularity || 0);
              case "name_asc":
                return a.name.localeCompare(b.name);
              default:
                return new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime();
            }
          });

          // Apply pagination
          const startIndex = (page - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginatedData = genreData.slice(startIndex, endIndex);

          setSeries(paginatedData);
          setTotalPages(Math.ceil(genreData.length / ITEMS_PER_PAGE));
          console.log(`Retrieved ${paginatedData.length} series for page ${page} (genre filtered)`);
          return;
        } catch (genreError) {
          console.error("Genre filter query failed, falling back to simple query:", genreError);
        }
      }

      // Fallback to simple query without complex filters
      queryConstraints.push(orderBy(sortField, sortDirection));

      // Get total count first (without pagination limits)
      const totalSnapshot = await getDocs(query(seriesQuery, ...queryConstraints));
      const total = totalSnapshot.size;
      console.log(`Total series found with current filters: ${total}`);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

      // Apply pagination
      if (page === 1) {
        queryConstraints.push(limit(ITEMS_PER_PAGE));
      } else {
        if (lastVisible) {
          queryConstraints.push(startAfter(lastVisible));
          queryConstraints.push(limit(ITEMS_PER_PAGE));
        }
      }

      const q = query(seriesQuery, ...queryConstraints);
      console.log("Constructed Firebase Query:", q);
      console.log("Query Constraints:", queryConstraints);

      const snapshot = await getDocs(q);
      const seriesData: FirebaseSeries[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Log the genres for debugging
        console.log(`Series ${data.name} genres:`, data.genres);
        seriesData.push({
          id: data.id,
          name: data.name,
          poster_path: data.poster_path,
          vote_average: data.vote_average,
          overview: data.overview,
          backdrop_path: data.backdrop_path,
          first_air_date: data.first_air_date,
          genres: data.genres || [],
          genre_ids: data.genre_ids || [],
          episode_run_time: data.episode_run_time || [],
          number_of_seasons: data.number_of_seasons,
          number_of_episodes: data.number_of_episodes,
          vote_count: data.vote_count,
          popularity: data.popularity,
          name_lowercase: data.name_lowercase,
          last_updated: data.last_updated,
          status: data.status,
          seasons: data.seasons || [],
          firebaseId: doc.id,
          episode_groups: data.episode_groups,
        });
      });

      setSeries(seriesData);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      // Log the results for debugging
      console.log(`Retrieved ${seriesData.length} series for page ${page}`);
      if (seriesData.length > 0) {
        console.log("First series in results:", seriesData[0].name, "Genres:", seriesData[0].genres);
        console.log("Last series in results:", seriesData[seriesData.length - 1].name, "Genres:", seriesData[seriesData.length - 1].genres);
      }
    } catch (error: any) {
      console.error("Error fetching series:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Try to fetch without filters as fallback
      try {
        console.log("Attempting to fetch series without filters as fallback...");
        const fallbackQuery = query(seriesQuery, orderBy("first_air_date", "desc"), limit(ITEMS_PER_PAGE));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackData: FirebaseSeries[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data();
          fallbackData.push({
            id: data.id,
            name: data.name,
            poster_path: data.poster_path,
            vote_average: data.vote_average,
            overview: data.overview,
            backdrop_path: data.backdrop_path,
            first_air_date: data.first_air_date,
            genres: data.genres || [],
            genre_ids: data.genre_ids || [],
            episode_run_time: data.episode_run_time || [],
            number_of_seasons: data.number_of_seasons,
            number_of_episodes: data.number_of_episodes,
            vote_count: data.vote_count,
            popularity: data.popularity,
            name_lowercase: data.name_lowercase,
            last_updated: data.last_updated,
            status: data.status,
            seasons: data.seasons || [],
            firebaseId: doc.id,
            episode_groups: data.episode_groups,
          });
        });
        
        setSeries(fallbackData);
        setTotalPages(Math.ceil(fallbackSnapshot.size / ITEMS_PER_PAGE));
        setLastVisible(fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1]);
        console.log(`Fallback successful: Retrieved ${fallbackData.length} series`);
        toast.error("Filters could not be applied, showing all series");
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        toast.error("Failed to load series");
      }
    } finally {
      setIsLoadingSeries(false);
    }
  };

  const fetchAllSeries = async () => {
    setIsLoading(true);
    setProgress(0);
    setProcessedSeries(0);

    try {
      console.log("Starting series update process...");
      
      // Create a temporary document to track progress
      const progressDocRef = doc(db, "progress", "series_update");
      console.log("Creating progress document...");
      
      try {
        await setDoc(progressDocRef, {
          total: 0,
          processed: 0,
          status: "in_progress",
          startTime: new Date().toISOString()
        });
        console.log("Progress document created successfully");
      } catch (error) {
        console.error("Error creating progress document:", error);
        // Continue even if we can't create the progress document
      }

      // First, get the total number of pages
      console.log("Fetching initial data from TMDB...");
      const initialResponse = await fetch(
        "https://api.themoviedb.org/3/tv/popular?language=en-US&page=1",
        {
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        }
      );
      const initialData = await initialResponse.json();
      const totalPages = initialData.total_pages;
      const totalSeries = initialData.total_results;
      
      console.log(`Total series to process: ${totalSeries}, Total pages: ${totalPages}`);
      
      // Update the progress document with total count
      try {
        await setDoc(progressDocRef, {
          total: totalSeries,
          processed: 0,
          status: "in_progress",
          startTime: new Date().toISOString()
        });
        console.log("Progress document updated with total count");
      } catch (error) {
        console.error("Error updating progress document with total:", error);
        // Continue even if we can't update the progress document
      }

      setTotalSeries(totalSeries);
      let processedCount = 0;
      let lastProgressUpdate = 0; // Track last progress update count
      let batch = writeBatch(db); // Create a batch for series updates
      let batchCount = 0;
      const BATCH_LIMIT = 500; // Firebase batch limit

      // Process each page
      for (let page = 1; page <= totalPages; page++) {
        console.log(`Processing page ${page} of ${totalPages}`);
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`,
          {
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
            },
          }
        );
        const data = await response.json();

        // Process each series in the current page
        for (const series of data.results) {
          console.log(`Processing series ${processedCount + 1} of ${totalSeries}: ${series.name}`);
          
          try {
            // Check if series already exists in Firebase
            const seriesDocRef = doc(db, "series", series.id.toString());
            const seriesDoc = await getDoc(seriesDocRef);

            if (!seriesDoc.exists()) {
              // Fetch detailed series data including seasons and episode groups
              const detailsResponse = await fetch(
                `https://api.themoviedb.org/3/tv/${series.id}?language=en-US&append_to_response=seasons,episode_groups`,
                {
                  headers: {
                    accept: "application/json",
                    Authorization:
                      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
                  },
                }
              );
              const seriesDetails: TmdbSeriesData = await detailsResponse.json();

              // Add to batch
              const genreIds = (seriesDetails.genres || []).map(g => g.id);
              const seriesData: FirebaseSeries = {
                id: seriesDetails.id,
                name: seriesDetails.name,
                poster_path: seriesDetails.poster_path,
                first_air_date: seriesDetails.first_air_date,
                overview: seriesDetails.overview,
                genre_ids: genreIds,
                vote_average: seriesDetails.vote_average,
                backdrop_path: seriesDetails.backdrop_path,
                number_of_seasons: seriesDetails.number_of_seasons,
                number_of_episodes: seriesDetails.number_of_episodes,
                status: seriesDetails.status,
                episode_run_time: seriesDetails.episode_run_time,
                popularity: seriesDetails.popularity,
                vote_count: seriesDetails.vote_count,
                last_air_date: seriesDetails.last_air_date,
                genres: (seriesDetails.genres || []).map(g => ({
                  id: g.id,
                  name: g.name || genresList.find(gg => gg.id === g.id)?.name || 'Unknown',
                })),
                seasons: seriesDetails.seasons || [],
                episode_groups: seriesDetails.episode_groups,
                firebaseId: seriesDetails.id.toString(),
                name_lowercase: seriesDetails.name.toLowerCase(),
                last_updated: serverTimestamp(),
              };
              batch.set(seriesDocRef, seriesData);
              batchCount++;

              // Store Seasons in a subcollection
              if (seriesDetails.seasons && seriesDetails.seasons.length > 0) {
                const seasonsCollectionRef = collection(seriesDocRef, "seasons");
                for (const season of seriesDetails.seasons) {
                  if (season.season_number > 0) {
                    const seasonDocRef = doc(seasonsCollectionRef, season.season_number.toString());
                    batch.set(seasonDocRef, {
                      id: season.id,
                      name: season.name,
                      overview: season.overview,
                      air_date: season.air_date,
                      episode_count: season.episode_count,
                      poster_path: season.poster_path,
                      season_number: season.season_number,
                      vote_average: season.vote_average,
                    } as FirebaseSeason);
                    batchCount++;
                  }
                }
              }

              // Commit batch if it reaches the limit
              if (batchCount >= BATCH_LIMIT) {
                try {
                  await batch.commit();
                  console.log(`Committed batch of ${batchCount} operations`);
                  batch = writeBatch(db);
                  batchCount = 0;
                } catch (error) {
                  console.error("Error committing batch:", error);
                  // Wait a bit before retrying
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }
          } catch (error) {
            console.error(`Error processing series ${series.id}:`, error);
            // Continue with next series
            continue;
          }

          processedCount++;
          
          // Update progress every 10 processed items
          if (processedCount - lastProgressUpdate >= 10 || processedCount === totalSeries) {
            try {
              // Update Firebase progress document
              await setDoc(progressDocRef, {
                total: totalSeries,
                processed: processedCount,
                status: "in_progress",
                startTime: new Date().toISOString()
              });
              
              // Calculate progress percentage
              const progressPercentage = Math.round((processedCount / totalSeries) * 100);
              console.log(`Progress updated: ${processedCount}/${totalSeries} (${progressPercentage}%)`);
              
              // Update state
              setProcessedSeries(processedCount);
              setProgress(progressPercentage);
              
              lastProgressUpdate = processedCount;
            } catch (error) {
              console.error("Error updating progress document:", error);
              // Continue even if we can't update the progress document
            }
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }

      // Commit any remaining batch operations
      if (batchCount > 0) {
        try {
          await batch.commit();
          console.log(`Committed final batch of ${batchCount} operations`);
        } catch (error) {
          console.error("Error committing final batch:", error);
        }
      }

      // Final progress update to 100%
      try {
        await setDoc(progressDocRef, {
          total: totalSeries,
          processed: totalSeries,
          status: "completed",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        });
        
        setProcessedSeries(totalSeries);
        setProgress(100);
        console.log("Progress completed: 100%");
      } catch (error) {
        console.error("Error marking progress as completed:", error);
      }

      toast.success("All series have been successfully processed and stored!");
      // Refresh the series list after fetching new data
      fetchSeriesFromFirebase(currentPage, selectedGenre, selectedYear, selectedSort, searchQuery);
    } catch (error) {
      console.error("Error in fetchAllSeries:", error);
      toast.error("An error occurred while processing series");
      
      // Update progress document to error state
      try {
        const progressDocRef = doc(db, "progress", "series_update");
        await setDoc(progressDocRef, {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          endTime: new Date().toISOString()
        });
        console.log("Progress document marked as error");
      } catch (updateError) {
        console.error("Error updating progress document with error state:", updateError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSearch = () => {
    // Trigger re-fetch with new search query
    setCurrentPage(1); // Reset to first page for new search
    fetchSeriesFromFirebase(1, selectedGenre, selectedYear, selectedSort, searchQuery);
    router.push(`/series/resultssearchseries?query=${encodeURIComponent(searchQuery)}`); // Keep redirection to results page
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate years from current year down to 1900
    for (let i = currentYear; i >= 1900; i--) {
      years.push(i.toString());
    }
    return years;
  };

  // Update the SeriesFilters component to handle genre changes
  const handleGenreChange = (genre: string) => {
    console.log("Genre changed to:", genre);
    setSelectedGenre(genre);
    setCurrentPage(1); // Reset to first page when genre changes
    setLastVisible(null); // Reset lastVisible to ensure proper pagination
  };

  const handleYearChange = (year: string) => {
    console.log("Year filter changed to:", year);
    setSelectedYear(year);
    setCurrentPage(1);
    setLastVisible(null);
  };

  // Add useEffect to log when genresList changes
  useEffect(() => {
    console.log("Current genresList:", genresList);
  }, [genresList]);

  // Add useEffect to log when selectedGenre changes
  useEffect(() => {
    console.log("Selected genre changed to:", selectedGenre);
  }, [selectedGenre]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('available_series', 'Available Series')}
          </h1>
          {/* Update Series Database button removed as requested */}
        </div>

        {/* Series Filters */}
        <SeriesFilters
          genres={genresList}
          onGenreChange={handleGenreChange}
          onYearChange={handleYearChange}
          onSortChange={(sort) => {
            setSelectedSort(sort);
            setCurrentPage(1);
            setLastVisible(null);
          }}
          yearOptions={getYearOptions()}
          selectedYear={selectedYear}
          selectedGenre={selectedGenre}
          selectedSort={selectedSort}
          labelGenre={t('genre', 'Genre')}
          labelYear={t('year', 'Year')}
          labelSort={t('sort', 'Sort')}
        />

        {isLoading && (
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="w-full" 
              indicatorClassName="bg-red-500" 
            />
            <p className="text-sm text-muted-foreground">
              Processed {processedSeries} of {totalSeries} series ({progress}%)
            </p>
          </div>
        )}

        {isLoadingSeries ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {series.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium">No series available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedYear !== "all" ? `No series found for year ${selectedYear}` : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {series.map((item) => (
                    <SeriesCard
                      key={item.id}
                      id={item.id}
                      title={item.name}
                      poster={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : "/placeholder.svg"}
                      genre={item.genres.map(g => g.name).join(", ")}
                      releaseDate={item.first_air_date}
                      rating={item.vote_average}
                    />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 