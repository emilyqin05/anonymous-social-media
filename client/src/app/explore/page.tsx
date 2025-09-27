"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import { useAppState } from "@/hooks/useAppState"

export default function ExplorePage() {
  const { posts, courses, followedTags, toggleTagFollow, toggleCourseFollow, followedCourses } = useAppState()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all") // Updated default value
  const [sortBy, setSortBy] = useState<"score" | "new">("score")

  const getExplorePosts = () => {
    let filteredPosts = posts.filter((post) => !post.courseId) // Only explore posts

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (selectedTag !== "all") {
      // Updated condition
      filteredPosts = filteredPosts.filter((post) => post.tags.includes(selectedTag))
    }

    return sortBy === "score"
      ? filteredPosts.sort((a, b) => b.score - a.score)
      : filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const explorePosts = getExplorePosts()
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-muted-foreground">Discover posts, courses, and tags from the community</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, courses, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem> {/* Updated value */}
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  #{tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: "score" | "new") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Hot</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 10).map((tag) => (
            <Badge
              key={tag}
              variant={followedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:bg-secondary"
              onClick={() => toggleTagFollow(tag)}
            >
              #{tag} {followedTags.includes(tag) && "✓"}
            </Badge>
          ))}
        </div>
      </div>

      {/* Popular Courses */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Popular Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{course.code}</h3>
                  <p className="text-sm text-muted-foreground">{course.name}</p>
                </div>
                <Button
                  variant={followedCourses.includes(course.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCourseFollow(course.id)}
                >
                  {followedCourses.includes(course.id) ? "Following" : "Follow"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{course.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{course.followerCount} followers</span>
                <Link href={`/course/${course.id}`}>
                  <Button variant="ghost" size="sm">
                    View Course
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Posts {selectedTag !== "all" && `tagged with #${selectedTag}`} {/* Updated condition */}
        </h2>
        {explorePosts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to create a post!"}
            </p>
            <Link href="/create">
              <Button>Create Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {explorePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
