import { useSearchParams } from 'next/navigation';

export default function SeriesWatchPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return <p className="text-center text-red-500">Aucune vidéo disponible.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-4xl">
        <video controls autoPlay className="w-full h-auto">
          <source src={videoUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    </div>
  );
}
