"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Course } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface CourseCardProps {
  course: Course
  isFollowing?: boolean
  onToggleFollow?: (courseId: string) => void
  showFollowButton?: boolean
}

export default function CourseCard({ 
  course, 
  isFollowing = false, 
  onToggleFollow,
  showFollowButton = true 
}: CourseCardProps) {
  const { user } = useAuth()

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold">{course.code}</h3>
          <p className="text-sm text-muted-foreground">{course.name}</p>
        </div>
        {showFollowButton && onToggleFollow && (
          <Button
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            onClick={() => user && onToggleFollow(course.id)}
            disabled={!user}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
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
  )
}
