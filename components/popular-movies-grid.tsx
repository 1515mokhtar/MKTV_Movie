import { useEffect, useState } from "react";
import { MovieCard } from "./movie-card";

export function PopularMoviesGrid() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Record<number, string>>({});

  // Fetch genres
  useEffect(() => {
    async function fetchGenres() {
      const res = await fetch(
        "https://api.themoviedb.org/3/genre/movie/list?language=en-US",
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
    async function fetchPopular() {
      setLoading(true);
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
            accept: "application/json",
          },
        }
      );
      const data = await res.json();
      setMovies(data.results || []);
      setLoading(false);
    }
    fetchPopular();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie: any) => (
        <MovieCard
          key={movie.id}
          title={movie.title}
          genre={
            movie.genre_ids
              ?.map((id: number) => genres[id])
              .filter(Boolean)
              .join(", ") || ""
          }
          releaseDate={movie.release_date}
          poster={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
              : "/placeholder.svg"
          }
          id={movie.id.toString()}
        />
      ))}
    </div>
  );
} 