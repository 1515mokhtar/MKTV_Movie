export interface SearchResult {
    id: number
    title?: string
    name?: string
    poster_path: string
    backdrop_path: string | null
    overview: string
    release_date?: string
    first_air_date?: string
    vote_average: number
    popularity?: number
    media_type: string
  }
  
  export async function searchMedia(query: string, mediaType: "movie" | "tv" | "both" = "both") {
    if (!query.trim()) return { results: [], error: null }
  
    try {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
        },
      }
  
      let results: SearchResult[] = []
  
      if (mediaType === "both" || mediaType === "movie") {
        const movieUrl = `https://api.themovie  = [];
      
      if (mediaType === 'both' || mediaType === 'movie') {
        const movieUrl = \`https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`
  
        const movieResponse = await fetch(movieUrl, options)
        if (!movieResponse.ok) {
          throw new Error(`HTTP error! status: ${movieResponse.status}`)
        }
  
        const movieData = await movieResponse.json()
        results = [...results, ...movieData.results.map((item: any) => ({ ...item, media_type: "movie" }))]
      }
  
      if (mediaType === "both" || mediaType === "tv") {
        const tvUrl = `https://api.themoviedb.org/3/search/tv?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`
  
        const tvResponse = await fetch(tvUrl, options)
        if (!tvResponse.ok) {
          throw new Error(`HTTP error! status: ${tvResponse.status}`)
        }
  
        const tvData = await tvResponse.json()
        results = [...results, ...tvData.results.map((item: any) => ({ ...item, media_type: "tv" }))]
      }
  
      // Sort by popularity
      results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  
      return { results, error: null }
    } catch (error: any) {
      return { results: [], error: error.message }
    }
  }
  
  export function formatMediaDate(date?: string): string {
    if (!date) return "N/A"
  
    try {
      const dateObj = new Date(date)
      return dateObj.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return "N/A"
    }
  }
  
  export function getMediaTitle(item: SearchResult): string {
    return item.title || item.name || "Sans titre"
  }
  
  