"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import { useAppState } from "@/hooks/useAppState"

export default function HomePage() {
  const { posts, courses, followedCourses, followedTags, professorPreferences } = useAppState()
  const [sortBy, setSortBy] = useState<"score" | "new">("score")

  const getHomeFeedPosts = () => {
    const followedCoursePosts = posts.filter((post) => {
      if (!post.courseId || !followedCourses.includes(post.courseId)) return false

      const preferredProf = professorPreferences[post.courseId]
      if (preferredProf && post.professor && post.professor !== preferredProf) return false

      return true
    })

    const explorePostsWithFollowedTags = posts.filter(
      (post) => !post.courseId && post.tags.some((tag) => followedTags.includes(tag)) && post.score >= 10,
    )

    const allHomePosts = [...followedCoursePosts, ...explorePostsWithFollowedTags]

    return sortBy === "score"
      ? allHomePosts.sort((a, b) => b.score - a.score)
      : allHomePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const homePosts = getHomeFeedPosts()

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
      {homePosts.length === 0 ? (
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
          {homePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
