"use client"

import { ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button" // Import shadcn/ui Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Import shadcn/ui Card components
import TrailerPlayer from "@/components/TrailerPlayer"
import { Video } from "lucide-react"
import VideoTrailer from "@/components/TrailerPlayer"

interface Movie {
  movieId?: string | number
  video?: string; // Mark as optional
  tagline?: ReactNode; // Mark as optional
  trailerUrl?: string; // Mark as optional
  watchUrl?: string; // Mark as optional
  actors?: any; // Mark as optional
  type?: ReactNode; // Mark as optional
  rating?: ReactNode; // Mark as optional
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  genres: { id: number; name: string }[];
  runtime: number;
  vote_average: number;
}

interface MovieDetailsProps {
  params: { id: string }
}

export default function MovieDetails({ params }: MovieDetailsProps) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  const movieId = parseInt(params.id, 10)

  if (isNaN(movieId)) {
    console.error("Invalid movie ID:", params.id)
    return <div>Invalid movie ID.</div>
  }

  // Debugging: Log the movieId
  console.log("Movie ID:", movieId, "Type:", typeof movieId)

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc'
          }
        };

        const response = await fetch(url, options)
        const data = await response.json()
        console.log( data.video)
        setMovie({
          id: data.id,
          title: data.title,
          overview: data.overview,
          release_date: data.release_date,
          poster_path: data.poster_path,
          genres: data.genres,
          runtime: data.runtime,
          vote_average: data.vote_average,
          tagline:data.tagline,
          video:data.video
        })
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movieId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!movie) {
    return <div>Movie not found.</div>
  }
  
  return (
    // <div className="container mx-auto p-4">
    //   <Card>
    //     <CardHeader>
    //       <CardTitle className="text-3xl font-bold text-gray-800">{movie.title}</CardTitle>
    //     </CardHeader>
    //     <CardContent>
    //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    //         {/* Poster and Trailer Section */}
    //         <div className="space-y-4">
    //           {/* Poster */}
    //           <img
    //             src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
    //             alt={movie.title}
    //             className="w-full max-w-sm rounded-lg shadow-md"
    //           />

    //           {/* Watch Now Button */}
    //           <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
    //             Watch Now
    //           </Button>

    //           {/* Trailer Zone */}
    //           <div className="bg-gray-100 p-4 rounded-lg">
    //           <TrailerPlayer/>
    //           </div>
    //         </div>

    //         {/* Details Section */}
    //         <div className="space-y-4">
    //           <p className="text-gray-700">{movie.overview}</p>
    //           <div className="space-y-2">
    //             <p className="text-gray-600">
    //               <strong>Release Date:</strong> {movie.release_date}
    //             </p>
    //             <p className="text-gray-600">
    //               <strong>Genres:</strong> {movie.genres.map((genre) => genre.name).join(", ")}
    //             </p>
    //             <p className="text-gray-600">
    //               <strong>Runtime:</strong> {movie.runtime} minutes
    //             </p>
    //             <p className="text-gray-600">
    //               <strong>Rating:</strong> {movie.vote_average}/10
    //             </p>
    //           </div>
    //         </div>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>


    <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 text-white p-6">
    {/* Trailer */}
    <div className="container mx-auto">
     <VideoTrailer movieId={String(movieId)} title="Featured Trailer" videoId={""} />

      </div>

     {/* Poster */}
             <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="w-full max-w-sm rounded-lg shadow-md"
            />
    
    {/* Movie Info */}
    <div className="w-full max-w-4xl mt-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
      <p className="text-gray-400 text-sm md:text-base">{movie.overview}</p>
      
      {/* Details */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-gray-300 text-sm md:text-base">
        <span>📅 {movie.release_date}</span>
        <span>⭐ {movie.rating}/10</span>
        <span>🎭 {movie.genres.map((genre) => genre.name).join(", ")}</span>
        <span>🎬 {movie.tagline}</span>
        <span>👥 {movie.actors}</span>
      </div>
    </div>
    
    {/* Watch Now Button */}
    <div className="mt-6">
      <a href={movie.watchUrl} target="_blank" rel="noopener noreferrer">
        <button className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-6 py-3 rounded-lg shadow-md transition-all">
          🎥 Regarder maintenant
        </button>
      </a>
    </div>
  </div>
);
}


  
