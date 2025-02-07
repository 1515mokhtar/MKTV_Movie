import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-background/60" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bghero3.webp?height=1080&width=1920')",
        }}
      />
      <div className="container relative flex h-full items-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">The Latest Blockbuster</h1>
          <p className="text-muted-foreground text-white text-lg">
            Watch the most anticipated movie of the year, now streaming exclusively on MKTV.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Watch Now
            </Button>
            <Button size="lg" variant="outline">
              More Info
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

