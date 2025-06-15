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
import { useTranslation } from 'react-i18next';

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
  const authContext = useAuth();
  const user = authContext?.user;
  const authLoading = authContext?.loading;
  const { t, i18n } = useTranslation('common');

  
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
              placeholder={t('header.searchPlaceholder')}
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
              onClick={handleSearchButtonClick}
              className="absolute right-0 top-1/2 -translate-y-1/2 md:relative md:top-auto md:translate-y-0 text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>

          {isSearchFocused && searchQuery.length > 0 && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md z-10 max-h-[400px] overflow-y-auto">
              <div className="grid gap-2 p-2">
                {searchResults.map((result) => (
                  <Button
                    key={result.id}
                    variant="ghost"
                    className="flex items-center justify-start gap-3 p-2 h-auto text-left"
                    onClick={() => handleResultClick(result)}
                  >
                    <Image
                      src={result.poster_path ? `https://image.tmdb.org/t/p/w92${result.poster_path}` : "/placeholder.svg"}
                      alt={result.title || result.name || "Poster"}
                      width={40}
                      height={60}
                      className="rounded-sm flex-shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {result.title || result.name} ({result.media_type === "movie" ? t('header.allMovies') : t('header.allSeries')})
                      </span>
                      {result.popularity !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          Popularity: {result.popularity.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => {
                    router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`)
                    setIsSearchFocused(false)
                  }}
                >
                  {t('header.searchPlaceholder')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <nav className="hidden lg:flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/movies/disponible" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('header.movies')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/series/seriesdisponible" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('header.tvSeries')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('header.nowRelease')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
          ) : (
            <>
              {/* Profile dropdown for authenticated users */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                      <span className="sr-only">{t('header.profile')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        {t('header.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/watchlist" className="cursor-pointer">
                        {t('header.watchlist')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/watch-history" className="cursor-pointer">
                        {t('header.watchHistory')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/recommendations" className="cursor-pointer">
                        {t('header.recommendations')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        {t('header.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('header.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t('header.login')}</Link>
                </Button>
              )}

              {/* Language Switcher for Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {i18n.language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')}>Français</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage('ar')}>العربية</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium pt-8">
                <Link
                  href="/movies/disponible"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Film className="h-5 w-5" />
                  {t('header.moviesDisponible')}
                </Link>
                <Link
                  href="/series/seriesdisponible"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Tv className="h-5 w-5" />
                  {t('header.seriesDisponible')}
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  {t('header.nowRelease')}
                </Link>
                {user && (
                  <>
                    <Link href="/watchlist" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.watchlist')}
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.profile')}
                    </Link>
                    <Link href="/watch-history" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.watchHistory')}
                    </Link>
                    <Link href="/recommendations" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.recommendations')}
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.settings')}
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-lg font-semibold justify-start p-0"
                      variant="ghost"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('header.logout')}</span>
                    </Button>
                  </>
                )}
                {!user && (
                  <>
                    <Link href="/login" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.login')}
                    </Link>
                    <Link href="/signup" className="flex items-center gap-2 text-lg font-semibold">
                      {t('header.signup')}
                    </Link>
                  </>
                )}
                {/* Language Switcher for Mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      {t('header.language')}: {i18n.language.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')}>Français</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => i18n.changeLanguage('ar')}>العربية</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

