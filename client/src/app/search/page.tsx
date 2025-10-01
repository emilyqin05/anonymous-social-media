"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft } from "lucide-react"
import { coursesApi, followsApi, Course } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function SearchPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [followedCourses, setFollowedCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
    // Get search query from URL
    const params = new URLSearchParams(window.location.search)
    const query = params.get('q') || ''
    setSearchQuery(query)
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchQuery, courses])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, followedCoursesData] = await Promise.all([
        coursesApi.getAll(),
        user ? followsApi.getFollowedCourses() : Promise.resolve([])
      ])
      
      setCourses(coursesData)
      setFollowedCourses(followedCoursesData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    if (!searchQuery.trim()) {
      setFilteredCourses([])
      return
    }

    const query = searchQuery.toLowerCase()
    const matches = courses.filter(
      (course) =>
        course.code.toLowerCase().startsWith(query) ||
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query)
    )
    
    setFilteredCourses(matches)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(searchQuery)}`
      window.history.pushState({}, '', newUrl)
      filterCourses()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
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

  const navigateToExplore = () => {
    window.location.href = '/explore'
  }

  const navigateToCourse = (courseId: string) => {
    window.location.href = `/course/${courseId}`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading search results...</div>
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
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={navigateToExplore}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Button>
        <h1 className="text-3xl font-bold mb-2">Search Courses</h1>
        <p className="text-muted-foreground">
          {searchQuery ? `Results for "${searchQuery}"` : 'Enter a search query to find courses'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div>
        {!searchQuery ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a course code or name to find courses
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              No courses match "{searchQuery}"
            </p>
            <Button onClick={navigateToExplore}>
              Browse All Courses
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{course.code}</h3>
                      <p className="text-sm text-muted-foreground">{course.name}</p>
                    </div>
                    <Button
                      variant={followedCourses.includes(course.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => user && toggleCourseFollow(course.id)}
                      disabled={!user}
                    >
                      {followedCourses.includes(course.id) ? "Following" : "Follow"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{course.followerCount} followers</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigateToCourse(course.id)}
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}