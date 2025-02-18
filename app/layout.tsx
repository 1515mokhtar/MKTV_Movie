
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from './contexts/AuthContext'
import type React from "react" // Added import for React
import { ToastContainer } from 'react-toastify';
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MKTV - Stream Your Favorite Movies",
  description: "Watch the latest movies and TV shows online",
  icons: {
    icon: [
      {
        url: "/iconMKTV3.ico",
        sizes: "500x500", // Make sure your .ico contains this size
        type: "image/x-icon",
      },
    ],
  },
}

export default function RootLayout({
  
  children,
}: {
  children: React.ReactNode
} 
) 


  {
   
  return (
    <html lang="en" suppressHydrationWarning>
      
        <link rel="icon" href="/iconMKTV3.ico" type="image/x-icon" />
      
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <ToastContainer />
        <AuthProvider>
        <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

