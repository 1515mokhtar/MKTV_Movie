"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselProps {
  children: React.ReactNode
  opts?: {
    align?: "start" | "center" | "end"
    loop?: boolean
  }
  className?: string
}

interface CarouselContentProps {
  children: React.ReactNode
  className?: string
}

interface CarouselItemProps {
  children: React.ReactNode
  className?: string
  [key: string]: any // Accept any additional props
}

export function Carousel({ children, opts = {}, className = "" }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [touchStart, setTouchStart] = React.useState(0)
  const [touchEnd, setTouchEnd] = React.useState(0)
  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length

  const nextSlide = () => {
    if (opts.loop) {
      setCurrentIndex((prev) => (prev + 1) % totalItems)
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1))
    }
  }

  const prevSlide = () => {
    if (opts.loop) {
      setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide()
    }
    if (touchEnd - touchStart > 50) {
      prevSlide()
    }
  }

  React.useEffect(() => {
    if (opts.loop) {
      const timer = setInterval(nextSlide, 5000)
      return () => clearInterval(timer)
    }
  }, [currentIndex, opts.loop])

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {children}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </Button>
    </div>
  )
}

export function CarouselContent({ children, className = "" }: CarouselContentProps) {
  return <div className={`flex ${className}`}>{children}</div>
}

export function CarouselItem({ children, className = "", ...props }: CarouselItemProps) {
  return <div className={`flex-shrink-0 w-full ${className}`} {...props}>{children}</div>
}

export function CarouselDots() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer"
        />
      ))}
    </div>
  )
} 