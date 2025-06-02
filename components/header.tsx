"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, User, LogOut, Menu, Film, Tv } from "lucide-react"
import Link from "next/link"
import { useState, useRef, type FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import Image from "next/image"

interface SearchResult {
  popularity: number
  id: number
  title?: string
  name?: string
  poster_path: string
  media_type?: string
  user?:boolean
}

interface HeaderProps {
  onSearch?: (query: string) => void
  initialSearchResults?: any[]
}

export function Header({ onSearch, initialSearchResults }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  
  // For double-click detection
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)

  // Ajoute un état pour forcer l'affichage des résultats même si <5 lettres après un clic
  const [forceShowResults, setForceShowResults] = useState(false)

  const performSearch = async (query: string, searchType = "both") => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      // Search for movies
      const movieUrl = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`
      const tvUrl = `https://api.themoviedb.org/3/search/tv?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
        },
      }

      let results: SearchResult[] = []

      if (searchType === "both" || searchType === "movie") {
        const movieResponse = await fetch(movieUrl, options)
        if (!movieResponse.ok) {
          throw new Error(`HTTP error! status: ${movieResponse.status}`)
        }
        const movieData = await movieResponse.json()
        // Add media_type to each result
        results = [...results, ...movieData.results.map((item: any) => ({ ...item, media_type: "movie" }))]
      }

      if (searchType === "both" || searchType === "tv") {
        const tvResponse = await fetch(tvUrl, options)
        if (!tvResponse.ok) {
          throw new Error(`HTTP error! status: ${tvResponse.status}`)
        }
        const tvData = await tvResponse.json()
        // Add media_type to each result
        results = [...results, ...tvData.results.map((item: any) => ({ ...item, media_type: "tv" }))]
      }

      // Sort by popularity if available
      results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

      // Limit to top 10 for dropdown
      setSearchResults(results.slice(0, 10))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const now = Date.now()
    const isDoubleClick = now - lastClickTime < 500
    setLastClickTime(now)

    if (isDoubleClick) {
      // Navigate to full search results page
      router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`)
      setIsSearchFocused(false)
    } else {
      // Regular search
      if (onSearch) {
        onSearch(searchQuery)
      } else {
        performSearch(searchQuery)
      }
    }
  }

  const handleSearchButtonClick = () => {
    const now = Date.now()
    const isDoubleClick = now - lastClickTime < 500
    setLastClickTime(now)

    if (isDoubleClick) {
      router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`)
      setIsSearchFocused(false)
    } else if (searchQuery.trim()) {
      performSearch(searchQuery)
      setForceShowResults(true)
      setIsSearchFocused(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const now = Date.now()
      const isDoubleEnter = now - lastKeyPressTime < 500
      setLastKeyPressTime(now)

      if (isDoubleEnter) {
        e.preventDefault()
        // Navigate to full search results page
        router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`)
        setIsSearchFocused(false)
      }
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setIsSearchFocused(false)
      }
    }, 100)
  }

  const handleResultClick = (result: SearchResult) => {
    const mediaType = result.media_type || "movie"
    const id = result.id

    if (mediaType === "movie") {
      router.push(`/movies/${id}`)
    } else if (mediaType === "tv") {
      router.push(`/series/${id}`)
    }

    setSearchQuery("")
    setIsSearchFocused(false)
    setSearchResults([])
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Déclenche la recherche seulement si la longueur >= 5 et après 700ms de pause
  useEffect(() => {
    if (searchQuery.trim().length >= 5) {
      const debounceTimer = setTimeout(() => {
        performSearch(searchQuery)
        setForceShowResults(false)
      }, 700)
      return () => clearTimeout(debounceTimer)
    } else if (!forceShowResults) {
      setSearchResults([])
    }
    // Si forceShowResults est actif, on ne vide pas les résultats
  }, [searchQuery, forceShowResults])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="font-bold text-2xl text-primary">
          MKTV
        </Link>

        <div ref={wrapperRef} className="relative flex-1 w-full max-w-full px-2 sm:px-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search movies & series..."
              className="w-full rounded-lg px-4 py-3 text-base text-lg md:text-base h-12 md:h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              style={{ minHeight: 48 }}
            />
            <Button
              ref={searchButtonRef}
              type="button"
              size="icon"
              variant="ghost"
              disabled={isLoading}
              className="rounded-lg h-12 w-12 md:h-10 md:w-10"
              onClick={handleSearchButtonClick}
            >
              <Search className="h-6 w-6" />
            </Button>
          </form>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length > 0 && (searchResults.length > 0 || isLoading || error) && (
            <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg mt-2 z-10 max-h-[400px] overflow-y-auto">
              {isLoading && <div className="p-4 text-center text-muted-foreground">Loading...</div>}
              {error && <div className="p-4 text-center text-destructive">Error: {error}</div>}
              {!isLoading && !error && searchResults.length === 0 && (
                 <div className="p-4 text-center text-muted-foreground">No results found.</div>
              )}
              {!isLoading && !error && searchResults.length > 0 && (
                <ul className="divide-y divide-border">
                  {searchResults.map((result) => (
                    <li key={result.id} className="p-2 hover:bg-muted cursor-pointer" onClick={() => handleResultClick(result)}>
                      <div className="flex items-center gap-2">
                        {result.poster_path ? (
                           <Image
                             src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                             alt={result.title || result.name || "No title"}
                             width={32}
                             height={48}
                             className="rounded object-cover"
                           />
                        ) : (
                           <div className="w-8 h-12 bg-muted-foreground rounded flex items-center justify-center text-xs text-background">No Img</div>
                        )}
                        <div>
                           <p className="font-semibold text-sm line-clamp-1">{result.title || result.name}</p>
                           {result.media_type && (
                             <p className="text-xs text-muted-foreground">{result.media_type === 'movie' ? 'Movie' : 'Series'}</p>
                           )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
               {!isLoading && !error && (searchQuery.length < 5 || forceShowResults) && searchResults.length > 0 && (
                <div className="p-2 border-t border-border">
                   <Link href={`/search-results?query=${encodeURIComponent(searchQuery)}`} className="text-sm text-mktv-accent hover:underline text-center block">
                      See all results
                   </Link>
                </div>
               )}
            </div>
          )}
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            {/* Movies Navigation Menu with Sub-list */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Movies</NavigationMenuTrigger>
              <NavigationMenuContent>
                 <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                   <li>
                     <NavigationMenuLink asChild>
                       <Link href="/movies">
                         All Movies
                       </Link>
                     </NavigationMenuLink>
                   </li>
                   <li>
                      <NavigationMenuLink asChild>
                        <Link href="/movies/disponible">
                          Movies disponible
                        </Link>
                      </NavigationMenuLink>
                   </li>
                  </ul>
               </NavigationMenuContent>
            </NavigationMenuItem>
            {/* Series Navigation Menu with Sub-list */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Series</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/series">
                        All Series
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                     <NavigationMenuLink asChild>
                       <Link href="/series/seriesdisponible">
                         Series Disponible
                       </Link>
                     </NavigationMenuLink>
                  </li>
                 </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/watchlist" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Watchlist
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Link href="/movies" className="text-lg font-semibold whitespace-nowrap">
                All movies
              </Link>
              <Link href="/movies/disponible" className="text-lg font-semibold whitespace-nowrap">
                Movies disponible
              </Link>
              <Link href="/series" className="text-lg font-semibold">
                Series
              </Link>
              <Link href="/watchlist" className="text-lg font-semibold">
                Watchlist
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-lg font-semibold">
                    Profile
                  </Link>
                  <Link href="/history" className="text-lg font-semibold">
                    Watch History
                  </Link>
                  <Link href="/recommendations" className="text-lg font-semibold">
                    Recommendations
                  </Link>
                  <Link href="/settings" className="text-lg font-semibold">
                    Settings
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" className="justify-start px-0">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-lg font-semibold">
                    Log in
                  </Link>
                  <Link href="/signup" className="text-lg font-semibold">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto md:ml-0">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user ? (
              <>
                <DropdownMenuItem className="hover:bg-primary">
                  <Link className="w-full" href="/profile">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="w-full" href="/settings">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <Link className="w-full" href="/login">
                    Log in
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="w-full" href="/signup">
                    Sign up
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

