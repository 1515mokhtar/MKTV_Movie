import { useEffect, useState } from "react";
import { MovieCard } from "./movie-card";

export function PopularSeriesHorizontalScroll() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Record<number, string>>({});

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
      // Sort by vote_average (rating), descending, and take top 20
      const sorted = (data.results || []).sort((a: any, b: any) => b.vote_average - a.vote_average).slice(0, 20);
      setSeries(sorted);
      setLoading(false);
    }
    fetchPopularSeries();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Popular TV Series</h2>
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
        {series.map((item: any) => (
          <div
            key={item.id}
            className="min-w-[180px] max-w-[200px] flex-shrink-0"
          >
            <MovieCard
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
              rating={item.vote_average}
              category="TV Series"
            />
          </div>
        ))}
      </div>
    </section>
  );
} 