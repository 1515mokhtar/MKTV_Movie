import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SeriesFiltersProps {
  genres: { id: number; name: string }[]
  onGenreChange: (genre: string) => void
  onYearChange: (year: string) => void
  onSortChange: (sort: string) => void
  yearOptions: string[]
}

export function SeriesFilters({ genres, onGenreChange, onYearChange, onSortChange, yearOptions }: SeriesFiltersProps) {
  return (
    <form className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={"all"} onValueChange={onGenreChange}>
          <SelectTrigger>
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.name}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={"all"} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={"date"} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first_air_date_desc">Release Date</SelectItem>
            <SelectItem value="popularity_desc">Popularity</SelectItem>
            <SelectItem value="vote_average_desc">Rating</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  )
}

