"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { Key, ReactElement, JSXElementConstructor, ReactNode, AwaitedReactNode } from "react"

interface MovieFiltersProps {
  genres?: { id: number; name: string }[] // Make genres optional
  onGenreChange: (genre: string) => void
  onYearChange: (year: string) => void
  onSortChange: (sort: string) => void
}

export function MovieFilters({ genres = [ ] ,onGenreChange, onYearChange, onSortChange }: MovieFiltersProps) {
  
  return (
    <div className="flex flex-wrap gap-4 mb-5">
      <Select defaultValue="all" onValueChange={onGenreChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.name.toLowerCase()}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="all" onValueChange={onYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="all">Select Year</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
          <SelectItem value="2023">2023</SelectItem>
          <SelectItem value="2022">2022</SelectItem>
          <SelectItem value="2021">2021</SelectItem>
          <SelectItem value="2020">2020</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="rating" onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Release Date</SelectItem>
          <SelectItem value="rating">Rating</SelectItem>
          <SelectItem value="views">Most Viewed</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon">
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}