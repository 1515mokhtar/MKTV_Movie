import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface SeriesCardProps {
  id: number
  title: string
  genre: string
  releaseDate: string
  poster: string
}

export function SeriesCard({ id, title, genre, releaseDate, poster }: SeriesCardProps) {
  return (
    <Link href={`/series/${id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[2/3]">
          <Image
            src={poster || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{genre}</p>
          <p className="text-sm text-muted-foreground">{releaseDate}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

