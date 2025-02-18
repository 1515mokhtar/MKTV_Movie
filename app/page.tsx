import { HeroSection } from "@/components/hero-section"
import { MovieCarousel } from "@/components/movie-carousel"
import { MovieGrid } from "@/components/movie-grid"
import { CategoryTabs } from "@/components/category-tabs"

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      
      <HeroSection />
      <div className="container space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
          <MovieCarousel />
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
          <MovieGrid />
        </section>
      </div>
    </div>
  )
}

