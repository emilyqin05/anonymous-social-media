"use client"

import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
  // Fake authentication state
  const [user, setUser] = useState<{ username: string } | null>({
    username: "EmilyQ",
  })

  const logout = () => setUser(null)
  const login = () => setUser({ username: "EmilyQ" }) // fake login

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              SFU Reddit
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* <Link
                  href="/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create Post
                </Link> */}
                <span className="text-gray-700">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <button
                  onClick={login}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={login}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
