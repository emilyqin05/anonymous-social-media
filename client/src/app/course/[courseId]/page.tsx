"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import { useAppState } from "@/hooks/useAppState"

interface CoursePageProps {
  params: {
    courseId: string
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const { posts, courses, followedCourses, professorPreferences, toggleCourseFollow, setProfessorPreference } =
    useAppState()
  const [sortBy, setSortBy] = useState<"score" | "new">("score")

  const course = courses.find((c) => c.id === params.courseId)
  const isFollowing = followedCourses.includes(params.courseId)
  const preferredProfessor = professorPreferences[params.courseId]

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Course not found</h1>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
      </div>
    )
  }

  const coursePosts = posts
    .filter((post) => post.courseId === params.courseId)
    .sort((a, b) =>
      sortBy === "score" ? b.score - a.score : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Course Header */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.code}</h1>
            <h2 className="text-xl text-muted-foreground mb-2">{course.name}</h2>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
          <Button variant={isFollowing ? "default" : "outline"} onClick={() => toggleCourseFollow(params.courseId)}>
            <BookOpen className="mr-2 h-4 w-4" />
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            {course.followerCount} followers
          </div>
        </div>

        {/* Professor Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Professors:</label>
          <div className="flex flex-wrap gap-2">
            {course.professors.map((professor) => (
              <Badge
                key={professor}
                variant={preferredProfessor === professor ? "default" : "outline"}
                className="cursor-pointer hover:bg-secondary"
                onClick={() => setProfessorPreference(params.courseId, professor)}
              >
                {professor}
                {preferredProfessor === professor && " ✓"}
              </Badge>
            ))}
          </div>
          {isFollowing && (
            <p className="text-xs text-muted-foreground">
              {preferredProfessor
                ? `You'll see posts from ${preferredProfessor} in your home feed`
                : "Select a professor to filter posts in your home feed"}
            </p>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Course Posts</h2>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={(value: "score" | "new") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Hot</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
          <Link href={`/create?course=${params.courseId}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        </div>
      </div>

      {coursePosts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to post in {course.code}!</p>
          <Link href={`/create?course=${params.courseId}`}>
            <Button>Create First Post</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {coursePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
