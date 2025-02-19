export interface Movie {
    id: string
    title: string
    genre: string
    releaseDate: string
    poster: string
    poster_path?: string
    posterPath?: string
    addedAt?: { toDate: () => Date }
    comment?: string
  }
  