"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import PostCard from "@/components/PostCard"

// Temporary placeholder data - we'll replace this with real API calls later
const mockPosts = [
  {
    id: 1,
    title: "Welcome to School Reddit!",
    content: "This is our first post. Let's build a great community together.",
    username: "admin",
    created_at: "2024-01-01T00:00:00Z",
    score: 10
  },
  {
    id: 2,
    title: "Study Group for Math 101",
    content: "Looking for people to form a study group for the upcoming midterm.",
    username: "student123",
    created_at: "2024-01-02T00:00:00Z",
    score: 0
  },
  {
    id: 3,
    title: "Campus Event: Tech Talk Tomorrow",
    content: "Don't miss the guest speaker from Google tomorrow at 3 PM in the auditorium. Free pizza!",
    username: "events_admin",
    created_at: "2024-01-03T00:00:00Z",
    score: -1
  }
]

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts)
  const [sortBy, setSortBy] = useState<"new">("new") // Simplified since we don't have scores yet

  // Simple sorting function - for now just sort by date
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">School Reddit</h1>
          <p className="text-gray-600">Share and discuss with your school community</p>
        </div>

        {/* Posts list */}
        <div className="space-y-4">
          {sortedPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share something with your school community!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}