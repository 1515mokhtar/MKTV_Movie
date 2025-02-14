"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, LogOut, Settings, Heart, Clock, Film } from 'lucide-react';
import Link from "next/link";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext"; // Assuming you have an AuthContext

interface HeaderProps {
  onSearch?: (query: string) => void;
  initialSearchResults?: any[];
}

export function Header({ onSearch, initialSearchResults }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth(); // Use the authentication context

 const performSearch = async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=4781aa55a1bf3c6ef05ee0bc0a94fcbc&query=${encodeURIComponent(
          query
        )}&page=1`
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setSearchResults(data.results); // On garde tous les résultats (on les affiche en scroll)
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await performSearch(searchQuery);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
      setIsSearchFocused(false);
    }
  };

  const handleMovieClick = (id: number) => {
    router.push(`/movies/${id}`);
  };


  const handleLogout = async () => {
    await logout();
    router.push('/'); // Redirect to home page after logout
  };

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

          {isSearchFocused && (error || searchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground shadow-lg rounded-lg p-4 z-50 border">
              {error && <p className="text-destructive text-sm mb-2">{error}</p>}
              
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Search Results</h3>
                  <ul className="max-h-64 overflow-y-auto space-y-3">
                    {searchResults.map((movie) => (
                      <li
                        key={movie.id}
                        className="flex gap-3 p-2 hover:bg-accent rounded transition-colors cursor-pointer"
                        onClick={() => handleMovieClick(movie.id)}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-16 h-24 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{movie.title}</h4>
                          <p className="text-sm line-clamp-2 text-muted-foreground">
                            {movie.overview}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {movie.release_date}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <NavigationMenu className="hidden md:flex ml-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/movies" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Movies
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/series" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Series
                </NavigationMenuLink>
              </Link>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto md:ml-0">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user ? (
              <>
                <DropdownMenuItem className="font-medium">
                  {user.name || user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/watchlist" className="flex w-full items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Watchlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/history" className="flex w-full items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Watch History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/recommendations" className="flex w-full items-center">
                    <Film className="mr-2 h-4 w-4" />
                    Recommendations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <Link href="/login" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    Log in
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/signup" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    Sign up
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}