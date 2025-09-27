"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, MessageCircle, Share } from "lucide-react"
import Link from "next/link"
import { useAppState, type Post } from "@/hooks/useAppState"

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { voteOnPost, courses } = useAppState()

  const handleVote = (voteType: number) => {
    voteOnPost(post.id, voteType)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? "just now" : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`
    }
  }

  const course = post.courseId ? courses.find((c) => c.id === post.courseId) : null

  return (
    <div className="bg-card rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex p-4">
        {/* Voting section */}
        <div className="flex flex-col items-center mr-4 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote(1)}
            className={`p-1 h-8 w-8 ${post.userVote === 1 ? "text-orange-500" : "text-muted-foreground"}`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span
            className={`text-sm font-medium ${
              post.userVote === 1 ? "text-orange-500" : post.userVote === -1 ? "text-blue-500" : "text-foreground"
            }`}
          >
            {post.score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote(-1)}
            className={`p-1 h-8 w-8 ${post.userVote === -1 ? "text-blue-500" : "text-muted-foreground"}`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Post content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center text-xs text-muted-foreground mb-2 space-x-2">
            {course && (
              <>
                <Link href={`/course/${course.id}`}>
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    {course.code}
                  </Badge>
                </Link>
                {post.professor && <Badge variant="outline">{post.professor}</Badge>}
              </>
            )}
            <span>u/{post.author}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>

          <h3 className="text-lg font-semibold mb-2 leading-tight">{post.title}</h3>

          <div className="text-sm text-muted-foreground mb-3">
            <p className="whitespace-pre-wrap break-words">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/explore?tag=${tag}`}>
                  <Badge variant="outline" className="text-xs hover:bg-secondary">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MessageCircle className="mr-1 h-3 w-3" />
              Comments
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share className="mr-1 h-3 w-3" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
