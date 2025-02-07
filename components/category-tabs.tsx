"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CategoryTabs() {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="movies">Movies</TabsTrigger>
        <TabsTrigger value="series">TV Series</TabsTrigger>
        <TabsTrigger value="new">New Releases</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

