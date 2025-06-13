"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { SeriesCard } from "@/components/series-card";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface TmdbSeriesData {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  overview: string;
  backdrop_path: string;
  first_air_date: string;
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  vote_count: number;
}

interface FirebaseSeries {
  id: string;
  name: string;
  poster_path: string;
  vote_average: number;
  overview: string;
  backdrop_path: string;
  first_air_date: string;
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  vote_count: number;
  last_updated: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const ITEMS_PER_PAGE = 20;

  const router = useRouter();

  // Function to fetch series from Firebase with pagination
  const fetchSeriesFromFirebase = async (page: number) => {
    setIsLoadingSeries(true);
    try {
      const seriesRef = collection(db, "series");
      
      // Get total count first
      const totalSnapshot = await getDocs(seriesRef);
      const total = totalSnapshot.size;
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

      // If it's the first page or we're searching, start from the beginning
      if (page === 1) {
        const q = query(
          seriesRef,
          orderBy("last_updated", "desc"),
          limit(ITEMS_PER_PAGE)
        );
        
        const snapshot = await getDocs(q);
        const seriesData: FirebaseSeries[] = [];
        
        snapshot.forEach((doc) => {
          seriesData.push({
            id: doc.id,
            ...doc.data() as Omit<FirebaseSeries, 'id'>
          });
        });

        setSeries(seriesData);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        // For subsequent pages, use the last visible document
        if (lastVisible) {
          const q = query(
            seriesRef,
            orderBy("last_updated", "desc"),
            startAfter(lastVisible),
            limit(ITEMS_PER_PAGE)
          );
          
          const snapshot = await getDocs(q);
          const seriesData: FirebaseSeries[] = [];
          
          snapshot.forEach((doc) => {
            seriesData.push({
              id: doc.id,
              ...doc.data() as Omit<FirebaseSeries, 'id'>
            });
          });

          setSeries(seriesData);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Failed to load series");
    } finally {
      setIsLoadingSeries(false);
    }
  };

  useEffect(() => {
    fetchSeriesFromFirebase(currentPage);
  }, [currentPage]);

  const fetchAllSeries = async () => {
    setIsLoading(true);
    setProgress(0);
    setProcessedSeries(0);

    try {
      // First, get the total number of pages
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
      setTotalSeries(initialData.total_results);

      // Process each page
      for (let page = 1; page <= totalPages; page++) {
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
          // Check if series already exists in Firebase
          const seriesDocRef = doc(db, "series", series.id.toString());
          const seriesDoc = await getDoc(seriesDocRef);

          if (!seriesDoc.exists()) {
            // Fetch detailed series data
            const detailsResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${series.id}?language=en-US`,
              {
                headers: {
                  accept: "application/json",
                  Authorization:
                    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
                },
              }
            );
            const seriesDetails: TmdbSeriesData = await detailsResponse.json();

            // Save to Firebase
            await setDoc(seriesDocRef, {
              name: seriesDetails.name,
              poster_path: seriesDetails.poster_path,
              vote_average: seriesDetails.vote_average,
              overview: seriesDetails.overview,
              backdrop_path: seriesDetails.backdrop_path,
              first_air_date: seriesDetails.first_air_date,
              genres: seriesDetails.genres,
              episode_run_time: seriesDetails.episode_run_time,
              number_of_seasons: seriesDetails.number_of_seasons,
              number_of_episodes: seriesDetails.number_of_episodes,
              vote_count: seriesDetails.vote_count,
              last_updated: new Date().toISOString(),
            });

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 250));
          }

          setProcessedSeries(prev => prev + 1);
          setProgress((processedSeries / totalSeries) * 100);
        }
      }

      toast.success("All series have been successfully processed and stored!");
      // Refresh the series list after fetching new data
      fetchSeriesFromFirebase(currentPage);
    } catch (error) {
      console.error("Error fetching and storing series:", error);
      toast.error("An error occurred while processing series");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/series/resultssearchseries?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Available Series
          </h1>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button 
              onClick={fetchAllSeries} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? "Processing..." : "Update Series Database"}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Processed {processedSeries} of {totalSeries} series ({Math.round(progress)}%)
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
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {series.map((item) => (
                    <SeriesCard
                      key={item.id}
                      id={parseInt(item.id)}
                      title={item.name}
                      genre={item.genres.map(g => g.name).join(", ")}
                      releaseDate={new Date(item.first_air_date).getFullYear().toString()}
                      poster={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : "/placeholder.svg"}
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