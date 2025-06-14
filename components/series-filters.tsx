import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SeriesFiltersProps {
  genres: { id: number; name: string }[]
  onGenreChange: (genre: string) => void
  onYearChange: (year: string) => void
  onSortChange: (sort: string) => void
  yearOptions: string[]
  selectedYear: string
}

export function SeriesFilters({
  genres,
  onGenreChange,
  onYearChange,
  onSortChange,
  yearOptions,
  selectedYear,
}: SeriesFiltersProps) {
  console.log("SeriesFilters received genres:", genres);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Genre Filter */}
      <Select onValueChange={onGenreChange} defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {genres && genres.length > 0 ? (
            genres
              .filter(genre => genre.name && genre.name.trim() !== '')
              .map((genre) => (
                <SelectItem key={genre.id} value={genre.name}>
                  {genre.name}
                </SelectItem>
              ))
          ) : (
            <SelectItem key="loading-genres" value="loading" disabled>
              Loading genres...
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Year Filter */}
      <Select onValueChange={onYearChange} value={selectedYear}>
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

