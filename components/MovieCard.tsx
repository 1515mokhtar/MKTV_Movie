import Image from 'next/image';
import { Movie } from '@/types/movie';
import { useRouter } from 'next/navigation';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  const handleWatchClick = () => {
    router.push(`/watch/${movie.id}`);
  };

  return (
    <div className="group relative">
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
        <Image
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handleWatchClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Watch Now
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-gray-400">{movie.release_date?.split('-')[0]}</p>
      </div>
    </div>
  );
} 