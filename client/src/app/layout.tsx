import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import BottomNav from "@/components/BottomNav"
import { AuthProvider } from "@/contexts/AuthContext"   // ✅ import your provider
import Navbar from "@/components/Navbar"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Reddit Clone",
  description: "A simplified Reddit clone for our school",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✅ Wrap everything in AuthProvider */}
        <AuthProvider>
          <Navbar />

          <div className="flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main className="flex-1 min-h-screen pb-16 md:pb-0">{children}</main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
