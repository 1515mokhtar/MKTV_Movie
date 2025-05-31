import { useEffect, useState } from "react";
import { MovieCard } from "./movie-card";

export function PopularSeriesGrid() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Record<number, string>>({});

  // Fetch genres
  useEffect(() => {
    async function fetchGenres() {
      const res = await fetch(
        "https://api.themoviedb.org/3/genre/tv/list?language=en-US",
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
            accept: "application/json",
          },
        }
      );
      const data = await res.json();
      const genreMap: Record<number, string> = {};
      data.genres.forEach((g: any) => (genreMap[g.id] = g.name));
      setGenres(genreMap);
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function fetchPopularSeries() {
      setLoading(true);
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/popular?language=en-US&page=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
            accept: "application/json",
          },
        }
      );
      const data = await res.json();
      setSeries(data.results || []);
      setLoading(false);
    }
    fetchPopularSeries();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {series.map((item: any) => (
        <MovieCard
          key={item.id}
          title={item.name}
          genre={
            item.genre_ids
              ?.map((id: number) => genres[id])
              .filter(Boolean)
              .join(", ") || ""
          }
          releaseDate={item.first_air_date}
          poster={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
              : "/placeholder.svg"
          }
          id={item.id.toString()}
        />
      ))}
    </div>
  );
} 