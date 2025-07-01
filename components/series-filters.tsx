import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from 'react-i18next';

interface SeriesFiltersProps {
  genres: { id: number; name: string }[]
  onGenreChange: (genre: string) => void
  onYearChange: (year: string) => void
  onSortChange: (sort: string) => void
  yearOptions: string[]
  selectedYear: string
  selectedGenre: string
  selectedSort: string
  labelGenre: string
  labelYear: string
  labelSort: string
}

export function SeriesFilters({
  genres,
  onGenreChange,
  onYearChange,
  onSortChange,
  yearOptions,
  selectedYear,
  selectedGenre,
  selectedSort,
  labelGenre,
  labelYear,
  labelSort,
}: SeriesFiltersProps) {
  const { t } = useTranslation('common');
  console.log("SeriesFilters received genres:", genres);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Genre Filter */}
      <div className="flex flex-col w-full sm:w-[180px]">
        <span className="mb-1 text-xs font-medium text-muted-foreground">{labelGenre}</span>
        <Select onValueChange={onGenreChange} value={selectedGenre ?? 'all'}>
          <SelectTrigger>
            <SelectValue>
              {selectedGenre === 'all'
                ? t('filters.allGenres')
                : genres.find(g => g.id && g.id.toString() === selectedGenre)?.name || selectedGenre}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {selectedGenre !== 'all' && (
              <div className="px-3 py-2 text-sm text-mktv-accent font-semibold border-b border-muted-foreground/20">
                Selected: {genres.find(g => g.id && g.id.toString() === selectedGenre)?.name || selectedGenre}
              </div>
            )}
            <SelectItem value="all">{t('filters.allGenres')}</SelectItem>
            {genres && genres.length > 0 ? (
              genres
                .filter(genre => genre.name && genre.name.trim() !== '')
                .map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </SelectItem>
                ))
            ) : (
              <SelectItem key="loading-genres" value="loading" disabled>
                {t('filters.loadingGenres')}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      <div className="flex flex-col w-full sm:w-[180px]">
        <span className="mb-1 text-xs font-medium text-muted-foreground">{labelYear}</span>
        <Select onValueChange={onYearChange} value={selectedYear}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.selectYearPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allYears')}</SelectItem>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="flex flex-col w-full sm:w-[180px]">
        <span className="mb-1 text-xs font-medium text-muted-foreground">{labelSort}</span>
        <Select onValueChange={onSortChange} value={selectedSort}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.sortByPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first_air_date_desc">{t('filters.newestFirst')}</SelectItem>
            <SelectItem value="first_air_date_asc">{t('filters.oldestFirst')}</SelectItem>
            <SelectItem value="vote_average_desc">{t('filters.highestRated')}</SelectItem>
            <SelectItem value="popularity_desc">{t('filters.mostPopular')}</SelectItem>
            <SelectItem value="name_asc">{t('filters.nameAsc')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

