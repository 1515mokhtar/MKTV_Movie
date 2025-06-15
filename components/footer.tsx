import { Facebook, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-card">
      <div className="container grid gap-8 py-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold">MKTV</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Stream your favorite movies and TV shows anytime, anywhere.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/movies/disponible" className="text-muted-foreground hover:text-foreground">
                Movies
              </Link>
            </li>
            <li>
              <Link href="/series/seriesdisponible" className="text-muted-foreground hover:text-foreground">
                TV Series
              </Link>
            </li>
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                New Releases
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/support/help-center" className="text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/support/terms-of-service" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/support/privacy-policy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Connect With Us</h4>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MKTV. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

