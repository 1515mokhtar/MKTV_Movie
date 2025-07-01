"use client"

import { HeroSection } from "@/components/hero-section"
import { MovieCarousel } from "@/components/movie-carousel"
import { MovieGrid } from "@/components/movie-grid"
import { CategoryTabs } from "@/components/category-tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from "@/components/carousel"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PopularMoviesGrid } from "@/components/popular-movies-grid"
import { PopularSeriesGrid } from "@/components/popular-series-grid"
import { useTranslation } from 'react-i18next';
import { type CarouselApi } from "@/components/carousel";

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string;
  overview: string;
  poster_path: string;
  media_type: string;
}

export default function Home() {
  const router = useRouter()
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation('common');
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) {
      return
    }

    let autoplayInterval: NodeJS.Timeout;

    const startAutoplay = () => {
      autoplayInterval = setInterval(() => {
        api.scrollNext();
      }, 10000);
    };

    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };

    // Start autoplay when component mounts or API is set
    startAutoplay();

    // Stop autoplay when component unmounts
    return () => stopAutoplay();
  }, [api]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true)
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzgxYWE1NWExYmYzYzZlZjA1ZWUwYmMwYTk0ZmNiYyIsIm5iZiI6MTczODcwNDY2Mi4wMDMsInN1YiI6IjY3YTI4NzE1N2M4NjA5NjAyOThhNjBmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kGBXkjuBtqgKXEGMVRWJ88LUWg_lykPOyBZKoOIBmcc",
          },
        };
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/all/day`,
          options
        )
        const data = await response.json()
        setTrendingItems(data.results.slice(0, 20)) // Fetch top 20 for main carousel
        console.log("Trending Data:", data.results.slice(0, 20));
      } catch (error) {
        console.error("Error fetching trending:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        {/* Main Content */}
        <main className="container py-8">
          <div className="flex flex-col gap-12">

            {/* Trending Now Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">{t('home.trendingNowMoviesSeries') ?? 'Trending Now: Movies & Series'}</h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                setApi={setApi}
                className="w-full"
              >
                <CarouselContent>
                  {trendingItems.map((item) => (
                    <CarouselItem key={item.id} className="basis-2/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 group relative cursor-pointer" onClick={() => {
                      if (item.media_type === 'movie') {
                        router.push(`/movies/${item.id}`);
                      } else if (item.media_type === 'tv') {
                        router.push(`/series/${item.id}`);
                      }
                    }}>
                      <div className="relative aspect-[2/3] w-full">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title || item.name}
                          className="rounded-md object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <h3 className="text-white text-center font-semibold text-lg px-2">{item.title || item.name}</h3>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselDots />
              </Carousel>
            </section>

            {/* Category Tabs */}
            {/* <CategoryTabs /> */}

            {/* Popular Movies Grid */}
            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-6">{t('home.popularMoviesTitle')}</h2>
              <PopularMoviesGrid />
            </section>

            {/* Popular Series Grid */}
            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-6">{t('home.popularSeriesTitle')}</h2>
              <PopularSeriesGrid />
            </section>
          </div>
        </main>
      </main>
    </div>
  )
}

