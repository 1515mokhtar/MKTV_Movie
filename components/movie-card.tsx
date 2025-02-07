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
    <Card className="overflow-hidden bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <CardHeader className="p-0">
        <div className="aspect-[2/3] relative overflow-hidden">
          <Image
            src={ poster|| "/placeholder.svg"}
            alt={`${title} poster`}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {releaseDate} • {genre}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link  href={`/movies/${id.toString()}`}>
        <Button variant="ghost" size="sm">
          Watch Now
        </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

