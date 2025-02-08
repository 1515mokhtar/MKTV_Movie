import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type React from "react" // Added import for React


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MKTV - Stream Your Favorite Movies",
  description: "Watch the latest movies and TV shows online",
  icons: "/iconMKTV.ico",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      
        <link rel="icon" href="/iconMKTV.ico" type="image/x-icon" />
      
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

