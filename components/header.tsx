"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
import { Search, User, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { useState, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"

interface HeaderProps {
  onSearch?: (query: string) => void
  initialSearchResults?: any[]
}

export function Header({ onSearch, initialSearchResults }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, logout } = useAuth()

  const performSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc'
        }
      };

      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSearchResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      performSearch(searchQuery)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setIsSearchFocused(false)
      }
    }, 100)
  }

  const handleMovieClick = (movieId: number) => {
    router.push(`/movies/${movieId}`)
    setSearchQuery("")
    setIsSearchFocused(false)
    setSearchResults([])
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="font-bold text-2xl text-primary">
          MKTV
        </Link>

        <div ref={wrapperRef} className="relative flex-1 md:max-w-96">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search movies..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={handleInputBlur}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" variant="ghost" disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {isSearchFocused && (
            <div className="absolute top-full left-0 w-full bg-background rounded-md shadow-md">
              {isLoading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center">No results found.</div>
              ) : (
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((result: any) => (
                    <li
                      key={result.id}
                      onClick={() => handleMovieClick(result.id)}
                      className="cursor-pointer p-2 hover:bg-primary flex  justify-between"
                    >
                      <img  width={40} height={40} src={`https://image.tmdb.org/t/p/w500${result.poster_path}`} alt={result.title} /> 
                     <div>
                     {result.title}
                     </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <NavigationMenu className="hidden md:flex ml-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/movies" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Movies</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/series" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Series</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/watchlist" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Watchlist</NavigationMenuLink>
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
              <Link href="/movies" className="text-lg font-semibold">
                Movies
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
                <DropdownMenuItem  className="hover:bg-primary">
                  <Link  className="w-full" href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link   className="w-full" href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <Link className="w-full" href="/login">Log in</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="w-full" href="/signup">Sign up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}