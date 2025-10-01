"use client"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PostCard from "@/components/PostCard"
import CourseCard from "@/components/CourseCard"
import { postsApi, coursesApi, followsApi, tagsApi, Post, Course } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function ExplorePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [followedTags, setFollowedTags] = useState<string[]>([])
  const [followedCourses, setFollowedCourses] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"score" | "new">("score")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      loadExplorePosts()
    }
  }, [selectedTag, sortBy])

  // Handle autocomplete filtering
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matches = courses.filter(
        (course) =>
          course.code.toLowerCase().startsWith(query) ||
          course.name.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query)
      ).slice(0, 5) // Limit to 5 suggestions
      
      setFilteredCourses(matches)
      setShowAutocomplete(matches.length > 0)
    } else {
      setFilteredCourses([])
      setShowAutocomplete(false)
    }
  }, [searchQuery, courses])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [postsData, coursesData, followedTagsData, followedCoursesData, tagsData] = await Promise.all([
        postsApi.getAll({ limit: 100 }),
        coursesApi.getAll(),
        user ? followsApi.getFollowedTags() : Promise.resolve([]),
        user ? followsApi.getFollowedCourses() : Promise.resolve([]),
        tagsApi.getAll()
      ])
      
      setPosts(postsData)
      setCourses(coursesData)
      setFollowedTags(followedTagsData)
      setFollowedCourses(followedCoursesData)
      setAllTags(tagsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadExplorePosts = async () => {
    try {
      const explorePosts = await postsApi.getAll({ 
        sortBy, 
        limit: 100 
      })
      setPosts(explorePosts)
    } catch (error) {
      console.error('Error loading explore posts:', error)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowAutocomplete(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCourseSelect = (course: Course) => {
    setSearchQuery("")
    setShowAutocomplete(false)
    router.push(`/course/${course.id}`)
  }

  const getExplorePosts = () => {
    let filteredPosts = posts.filter((post) => !post.courseId)

    if (selectedTag !== "all") {
      filteredPosts = filteredPosts.filter((post) => post.tags.includes(selectedTag))
    }

    return filteredPosts
  }

  const explorePosts = getExplorePosts()

  const toggleTagFollow = async (tag: string) => {
    if (!user) return
    
    try {
      if (followedTags.includes(tag)) {
        await followsApi.unfollowTag(tag)
        setFollowedTags(prev => prev.filter(t => t !== tag))
      } else {
        await followsApi.followTag(tag)
        setFollowedTags(prev => [...prev, tag])
      }
      window.dispatchEvent(new CustomEvent('sidebar-refresh'))
    } catch (error) {
      console.error('Error toggling tag follow:', error)
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading explore page...</div>
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
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-muted-foreground">Discover posts, courses, and tags from the community</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && filteredCourses.length > 0 && setShowAutocomplete(true)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setShowAutocomplete(false)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className="w-full text-left px-4 py-3 hover:bg-accent border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{course.code}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{course.name}</div>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {course.followerCount} followers
                      </Badge>
                    </div>
                  </button>
                ))}
                <div className="px-4 py-2 text-xs text-muted-foreground border-t bg-muted/50">
                  Press Enter to see all results
                </div>
              </div>
            )}
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
              <SelectItem value="all">All tags</SelectItem>
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
              className={`cursor-pointer hover:bg-secondary ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => user && toggleTagFollow(tag)}
            >
              #{tag} {followedTags.includes(tag) && "✓"}
            </Badge>
          ))}
        </div>
        {!user && (
          <p className="text-sm text-muted-foreground mt-2">Log in to follow tags</p>
        )}
      </div>

      {/* Popular Courses */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Popular Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.slice(0, 6).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isFollowing={followedCourses.includes(course.id)}
              onToggleFollow={toggleCourseFollow}
              showFollowButton={true}
            />
          ))}
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Posts {selectedTag !== "all" && `tagged with #${selectedTag}`}
        </h2>
        {explorePosts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedTag !== "all"
                ? "Try adjusting your filters"
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