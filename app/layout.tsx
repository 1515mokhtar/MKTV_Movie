import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from './contexts/AuthContext'
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MKTV - Stream Your Favorite Movies",
  description: "Watch the latest movies and TV shows online",
  icons: {
    icon: [
      {
        url: "/iconMKTV3.ico",
        sizes: "500x500",
        type: "image/x-icon",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/iconMKTV3.ico" type="image/x-icon" />
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="relative min-h-screen">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
              <div className="relative">
                <Header />
                <main>{children}</main>
                <Footer />
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

