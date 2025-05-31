import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface MovieCardProps {
  title: string
  genre: string
  releaseDate: string
  poster: string
  id: string
  category?: string // Optional category name
}

export function MovieCard({ id, title, genre, releaseDate, poster, category }: MovieCardProps) {
  // Extract year from releaseDate
  const year = releaseDate && releaseDate !== 'Unknown' ? releaseDate.split("-")[0] : "";

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-all duration-300 hover:shadow-lg">
      <Link href={`/movies/${id}`} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
        <CardHeader className="p-0">
          <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
            <Image
              src={poster || "/placeholder.svg"}
              alt={`${title} poster`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {category && (
            <div className="text-xs font-semibold text-mktv-accent mb-1 truncate">{category}</div>
          )}
          <h3 className="font-semibold truncate text-sm sm:text-base">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {genre}
            {year && ` • ${year}`}
          </p>
        </CardContent>
      </Link>
    </Card>
  )
}

