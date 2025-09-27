"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import { usersApi, Post } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState<"score" | "new">("score")

  useEffect(() => {
    if (user) {
      loadFeed()
    }
  }, [user, sortBy])

  const loadFeed = async () => {
    try {
      setLoading(true)
      const feedPosts = await usersApi.getFeed({ sortBy, limit: 50 })
      setPosts(feedPosts)
    } catch (error) {
      console.error('Error loading feed:', error)
      setError('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Welcome to School Reddit</h1>
          <p className="text-muted-foreground mb-4">Please log in to see your personalized feed</p>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Home Feed</h1>
        <p className="text-muted-foreground">
          Posts from your followed courses and popular posts with your followed tags
        </p>
      </div>

      {/* Sort and Create Post */}
      <div className="flex items-center justify-between mb-6">
        <Select value={sortBy} onValueChange={(value: "score" | "new") => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Hot</SelectItem>
            <SelectItem value="new">New</SelectItem>
          </SelectContent>
        </Select>

        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading your feed...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadFeed}>Try Again</Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-medium mb-2">No posts in your feed</h3>
            <p className="text-muted-foreground mb-4">
              Follow some courses and tags to see posts here, or explore to find interesting content!
            </p>
            <div className="space-x-2">
              <Link href="/explore">
                <Button variant="outline">Explore</Button>
              </Link>
              <Link href="/create">
                <Button>Create Post</Button>
              </Link>
            </div>
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
  )
}
