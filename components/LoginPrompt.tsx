import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-primary to-secondary">
      <h1 className="text-4xl font-bold text-white mb-8">Welcome to Your Watchlist</h1>
      <p className="text-xl text-white mb-8">Please log in or sign up to access your watchlist.</p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
      <Link href="/" className="mt-8 text-white hover:underline">
        Return to Home
      </Link>
    </div>
  )
}

