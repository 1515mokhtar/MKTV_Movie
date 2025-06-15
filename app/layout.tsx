import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from './contexts/AuthContext'
import type React from "react"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import dynamic from 'next/dynamic'

// Dynamically import I18nProvider with ssr: false
const DynamicI18nProvider = dynamic(() => import('@/app/i18n-provider').then(mod => mod.I18nProvider), {
  ssr: false,
  loading: () => null, // Optional: A loading component or null
})

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
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable,
      )}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <DynamicI18nProvider>
              <div className="relative min-h-screen">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="relative">
                  <Header />
                  <main>{children}</main>
                  <Footer />
                </div>
              </div>
            </DynamicI18nProvider>
          </AuthProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

