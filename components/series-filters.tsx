import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SeriesFiltersProps {
  genres: { id: number; name: string }[]
  onGenreChange: (genre: string) => void
  onYearChange: (year: string) => void
  onSortChange: (sort: string) => void
  yearOptions: string[]
}

export function SeriesFilters({
  genres,
  onGenreChange,
  onYearChange,
  onSortChange,
  yearOptions,
}: SeriesFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Genre Filter */}
      <Select onValueChange={onGenreChange} defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.name}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Filter */}
      <Select onValueChange={onYearChange} defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {yearOptions.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Filter */}
      <Select onValueChange={onSortChange} defaultValue="first_air_date_desc">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="first_air_date_desc">Newest First</SelectItem>
          <SelectItem value="first_air_date_asc">Oldest First</SelectItem>
          <SelectItem value="vote_average_desc">Highest Rated</SelectItem>
          <SelectItem value="popularity_desc">Most Popular</SelectItem>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

