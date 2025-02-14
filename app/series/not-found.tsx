import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-4xl font-bold mb-4">404 - Series Not Found</h2>
      <p className="text-xl mb-8">We couldn't find the series you're looking for.</p>
      <Button asChild>
        <Link href="/series">Back to Series List</Link>
      </Button>
    </div>
  )
}

