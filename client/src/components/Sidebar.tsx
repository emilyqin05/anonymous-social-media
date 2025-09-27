"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, BookOpen, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { coursesApi, followsApi, Course } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [followedCourses, setFollowedCourses] = useState<string[]>([])
  const [followedTags, setFollowedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

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
      const [coursesData, followedCoursesData, followedTagsData] = await Promise.all([
        coursesApi.getAll(),
        followsApi.getFollowedCourses(),
        followsApi.getFollowedTags()
      ])
      
      setCourses(coursesData)
      setFollowedCourses(followedCoursesData)
      setFollowedTags(followedTagsData)
    } catch (error) {
      console.error('Error loading sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const followedCourseData = courses.filter((course) => followedCourses.includes(course.id))

  // Expose refresh function to parent components
  useEffect(() => {
    // Listen for custom events to refresh sidebar data
    const handleRefresh = () => {
      if (user) {
        loadData()
      }
    }

    window.addEventListener('sidebar-refresh', handleRefresh)
    return () => window.removeEventListener('sidebar-refresh', handleRefresh)
  }, [user])

  if (!user) {
    return (
      <div className="w-64 bg-background border-r border-border h-screen sticky top-0 p-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h2>
            <div className="space-y-1">
              <Link href="/">
                <Button variant={pathname === "/" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant={pathname === "/explore" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Compass className="mr-2 h-4 w-4" />
                  Explore
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Log in to see your courses and tags</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-background border-r border-border h-screen sticky top-0 p-4">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h2>
          <div className="space-y-1">
            <Link href="/">
              <Button variant={pathname === "/" ? "secondary" : "ghost"} className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant={pathname === "/explore" ? "secondary" : "ghost"} className="w-full justify-start">
                <Compass className="mr-2 h-4 w-4" />
                Explore
              </Button>
            </Link>
          </div>
        </div>

        {/* Followed Courses */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Your Courses</h2>
          <div className="space-y-1">
            {loading ? (
              <p className="text-sm text-muted-foreground px-3 py-2">Loading...</p>
            ) : followedCourseData.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-2">No courses followed yet</p>
            ) : (
              followedCourseData.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <Button
                    variant={pathname === `/course/${course.id}` ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{course.code}</div>
                      <div className="text-xs text-muted-foreground truncate">{course.name}</div>
                    </div>
                  </Button>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Followed Tags */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Followed Tags</h2>
          <div className="space-y-1">
            {loading ? (
              <p className="text-sm text-muted-foreground px-3 py-2">Loading...</p>
            ) : followedTags.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-2">No tags followed yet</p>
            ) : (
              followedTags.map((tag) => (
                <Link key={tag} href={`/explore?tag=${tag}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Hash className="mr-2 h-4 w-4" />
                    {tag}
                  </Button>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
export { Sidebar }
