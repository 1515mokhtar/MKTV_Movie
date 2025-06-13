"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SeriesActionsProps {
  series: {
    id: number;
    name: string;
    vote_average: number;
    first_air_date: string;
    genres: Array<{ id: number; name: string }>;
    poster_path: string | null;
    seasons?: any[];
    videos?: { results: any[] };
  };
}

export function SeriesActions({ series }: SeriesActionsProps) {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || loading) return;

    const checkWatchlist = async () => {
      try {
        const docRef = doc(db, "watchlist", `${user.uid}_${series.id}`);
        const docSnap = await getDoc(docRef);
        setIsInWatchlist(docSnap.exists());
      } catch (error) {
        console.error("Error checking watchlist:", error);
        toast.error("Failed to check watchlist status");
      }
    };

    checkWatchlist();
  }, [user, series.id, loading]);

  const handleWatchNow = () => {
    // Find a trailer video
    const trailer = series.videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube");

    if (trailer) {
      router.push(`https://www.youtube.com/watch?v=${trailer.key}`);
    } else if (series.seasons && series.seasons.length > 0) {
      // Fallback to navigating to the first episode of the first season if no trailer
      router.push(`/serieswatch/${series.id}/${series.seasons[0].season_number}/1`);
    } else {
      toast.error("No episodes or trailers available");
    }
  };

  const handleWatchlist = async () => {
    if (processing) return;

    if (!user) {
      toast.error("Please login to add to watchlist");
      router.push("/login");
      return;
    }

    setProcessing(true);

    try {
      const docRef = doc(db, "watchlist", `${user.uid}_${series.id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await deleteDoc(docRef);
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await setDoc(docRef, {
          userId: user.uid,
          movieId: series.id,
          title: series.name,
          rater: series.vote_average.toFixed(1),
          releaseDate: series.first_air_date,
          genre: series.genres,
          posterPath: series.poster_path,
          addedAt: new Date(),
          type: "series",
          source: "mktv",
          status: "active"
        });
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      console.error("Watchlist error:", error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button 
        size="lg" 
        onClick={handleWatchNow}
        className="bg-red-600 hover:bg-red-700"
      >
        Watch Now
      </Button>
      <Button 
        size="lg" 
        variant="outline" 
        onClick={handleWatchlist}
        disabled={processing}
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : isInWatchlist ? (
          "Remove from Watchlist"
        ) : (
          "Add to Watchlist"
        )}
      </Button>
    </div>
  );
} 