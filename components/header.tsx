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
import { Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface HeaderProps {
  onSearch?: (query: string) => void; // Make it optional
  initialSearchResults?: any[]; // Adjust the type as needed
}

export function Header({ onSearch, initialSearchResults }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let page = 1;
      let found = false;

      while (!found) {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=4781aa55a1bf3c6ef05ee0bc0a94fcbc&query=${encodeURIComponent(
            query
          )}&page=${page}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        const matchedMovie = data.results.find((movie: any) =>
          movie.title.toLowerCase().includes(query.toLowerCase())
        );

        if (matchedMovie) {
          setSearchResults([matchedMovie]);
          found = true;
        } else if (data.total_pages && page < data.total_pages) {
          page++;
        } else {
          setError("Movie not found.");
          break;
        }
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="font-bold text-2xl text-primary">
          MKTV
        </Link>
        <div className="flex items-center gap-2 md:w-96">
          <Input
            type="search"
            placeholder="Search movies..."
            className="w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              debouncedSearch(e.target.value);
            }}
            disabled={isLoading}
          />
          <Button size="icon" variant="ghost" onClick={() => debouncedSearch(searchQuery)}>
            <Search className="h-4 w-4" />
          </Button>
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
        <Button variant="ghost" size="icon" className="ml-auto md:ml-0">
          <User className="h-5 w-5" />
        </Button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {searchResults.length > 0 && (
  <div className="movie-list mt-4 w-full max-w-lg mx-auto bg-black text-white shadow-lg rounded-lg p-4">
    <h2 className="text-xl font-semibold mb-2">Search Results</h2>
    <ul className="space-y-3">
      {searchResults.map((movie) => (
        <li
          key={movie.id}
          className="flex items-center gap-4 p-2 border-b hover:bg-gray-500 transition-all rounded-lg"
        >
          <img
            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} // Smaller size
            alt={movie.title}
            className="w-16 h-24 rounded-md object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-50">{movie.title}</h3>
            <p className="text-sm line-clamp-2">{movie.overview}</p>
            <p className="text-xs t">📅 {movie.release_date}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}
    </header>
  );
}
