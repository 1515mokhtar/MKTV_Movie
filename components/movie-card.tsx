import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart } from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

interface MovieCardProps {
  title: string
  genre: string
  releaseDate: string
  poster: string
  id: string

}

export function MovieCard({ id ,title, genre, releaseDate, poster }: MovieCardProps) {

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
        <h3 className="font-semibold truncate text-sm sm:text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {releaseDate} • {genre}
        </p>
      </CardContent>
    </Link>
  </Card>
  )
}

