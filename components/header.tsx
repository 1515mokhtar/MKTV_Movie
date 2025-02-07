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
import { Search, User } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="font-bold text-2xl text-primary">
          MKTV
        </Link>
        <div className="flex items-center gap-2 md:w-96">
          <Input type="search" placeholder="Search movies..." className="w-full" />
          <Button size="icon" variant="ghost">
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
    </header>
  )
}

