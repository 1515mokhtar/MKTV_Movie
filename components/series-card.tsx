import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface SeriesCardProps {
  id: number
  title: string
  genre: string
  releaseDate: string
  poster?: string // Make poster optional
  rating?: number // Optional rating for the series
}

export function SeriesCard({ id, title, genre, releaseDate, poster, rating }: SeriesCardProps) {
  const year = releaseDate && releaseDate !== 'Unknown' ? releaseDate.split("-")[0] : "";

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-all duration-300 hover:shadow-lg">
      <Link href={`/series/${id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg h-full">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <Image
            src={poster || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay for content on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-end p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="font-semibold text-sm sm:text-base text-white truncate mb-1">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-white/80">
              {genre}
              {year && ` • ${year}`}
            </p>
            {rating !== undefined && ( 
              <div className="flex items-center text-yellow-400 mt-2">
                <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}

