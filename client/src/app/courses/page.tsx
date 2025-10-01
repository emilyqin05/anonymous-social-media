"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Compass, Plus } from "lucide-react"
import Link from "next/link"
import CourseCard from "@/components/CourseCard"
import { coursesApi, followsApi, Course } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function FollowedCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [followedCourses, setFollowedCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, followedCoursesData] = await Promise.all([
        coursesApi.getAll(),
        followsApi.getFollowedCourses()
      ])
      
      setCourses(coursesData)
      setFollowedCourses(followedCoursesData)
    } catch (error) {
      console.error('Error loading followed courses:', error)
      setError('Failed to load followed courses')
    } finally {
      setLoading(false)
    }
  }

  const toggleCourseFollow = async (courseId: string) => {
    if (!user) return
    
    try {
      if (followedCourses.includes(courseId)) {
        await followsApi.unfollowCourse(courseId)
        setFollowedCourses(prev => prev.filter(id => id !== courseId))
      } else {
        await followsApi.followCourse(courseId)
        setFollowedCourses(prev => [...prev, courseId])
      }
      window.dispatchEvent(new CustomEvent('sidebar-refresh'))
    } catch (error) {
      console.error('Error toggling course follow:', error)
    }
  }

  const followedCourseData = courses.filter((course) => followedCourses.includes(course.id))

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Your Courses</h1>
          <p className="text-muted-foreground mb-4">Please log in to view your followed courses.</p>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading your courses...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Your Courses</h1>
          <Link href="/explore">
            <Button variant="outline">
              <Compass className="mr-2 h-4 w-4" />
              Follow More Courses
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">
          {followedCourseData.length === 0 
            ? "You haven't followed any courses yet. Explore courses to get started!"
            : `You're following ${followedCourseData.length} course${followedCourseData.length === 1 ? '' : 's'}.`
          }
        </p>
      </div>

      {followedCourseData.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-2">No courses followed yet</h3>
          <p className="text-muted-foreground mb-4">
            Start following courses to see them here and get updates in your home feed.
          </p>
          <Link href="/explore">
            <Button>
              <Compass className="mr-2 h-4 w-4" />
              Explore Courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followedCourseData.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isFollowing={true}
              onToggleFollow={toggleCourseFollow}
              showFollowButton={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
