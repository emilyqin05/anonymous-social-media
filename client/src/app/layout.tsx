import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import { AuthProvider } from "@/contexts/AuthContext"   // ✅ import your provider
import Navbar from "@/components/Navbar"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SFU Reddit Clone",
  description: "A simplified Reddit clone for our SFU",
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
            <Sidebar />
            <main className="flex-1 min-h-screen">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
