"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { SeriesCard } from "@/components/series-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

export default function ResultsSearchSeriesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filteredSeries, setFilteredSeries] = useState<FirebaseSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndFilterSeries = async (queryParam: string) => {
    setIsLoading(true);
    try {
      const seriesRef = collection(db, "series");
      let q = query(seriesRef);

      if (queryParam.trim()) {
        // Perform a "starts with" query for title
        q = query(
          seriesRef,
          where("name", ">=", queryParam),
          where("name", "<=", queryParam + '\uf8ff'), // Unicode character to match all strings starting with queryParam
          orderBy("name")
        );
      }

      const snapshot = await getDocs(q);
      const searchResults: FirebaseSeries[] = [];

      snapshot.forEach((doc) => {
        searchResults.push({
          id: doc.id,
          ...doc.data() as Omit<FirebaseSeries, 'id'>
        });
      });

      // Client-side sort to prioritize exact matches if any
      searchResults.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const lowerCaseQuery = queryParam.toLowerCase();

        if (aName === lowerCaseQuery && bName !== lowerCaseQuery) return -1;
        if (aName !== lowerCaseQuery && bName === lowerCaseQuery) return 1;
        return aName.localeCompare(bName);
      });

      setFilteredSeries(searchResults);
    } catch (error) {
      console.error("Error fetching and filtering series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndFilterSeries(initialQuery);
  }, [initialQuery]);

  // Handle new searches from the input on this page
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchAndFilterSeries(searchQuery);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Search Results for "{searchQuery}"
          </h1>
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredSeries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium">No series found</p>
                <p className="text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                  <br />
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredSeries.map((item) => (
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
            )}
          </>
        )}
      </div>
    </div>
  );
} 