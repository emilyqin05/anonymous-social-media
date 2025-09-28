"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { postsApi, coursesApi, tagsApi, followsApi } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function CreatePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedProfessor, setSelectedProfessor] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  // Data from API
  const [courses, setCourses] = useState<any[]>([])
  const [followedCourses, setFollowedCourses] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      loadData()
    }
  }, [user, router])

  const loadData = async () => {
    try {
      setLoadingData(true)
      const [coursesData, followedCoursesData, tagsData] = await Promise.all([
        coursesApi.getAll(),
        followsApi.getFollowedCourses(),
        tagsApi.getAll()
      ])
      
      setCourses(coursesData)
      setFollowedCourses(followedCoursesData)
      setAvailableTags(tagsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load form data')
    } finally {
      setLoadingData(false)
    }
  }

  const getProfessorsForCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.professors : []
  }

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content")
      setLoading(false)
      return
    }

    try {
      await postsApi.create({
        title: title.trim(),
        content: content.trim(),
        courseId: selectedCourse === "general" ? undefined : selectedCourse || undefined,
        professor: selectedProfessor === "all" ? undefined : selectedProfessor || undefined,
        tags: selectedTags
      })
      router.push("/")
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">Please log in to create a post.</div>
        </div>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">Loading form data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Post</h1>
          <p className="text-gray-600">Share something with your SFU community</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course (Optional)
              </label>
              <Select value={selectedCourse} onValueChange={(value) => {
                setSelectedCourse(value)
                setSelectedProfessor("") // Reset professor when course changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course to post in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Discussion (Explore)</SelectItem>
                  {followedCourses.map(courseId => {
                    const course = courses.find(c => c.id === courseId)
                    return course ? (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ) : null
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Professor Selection */}
            {selectedCourse && selectedCourse !== "general" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professor (Optional)
                </label>
                <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Professors</SelectItem>
                    {getProfessorsForCourse(selectedCourse).map((professor: string) => (
                      <SelectItem key={professor} value={professor}>
                        {professor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(newTag.trim())
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={() => addTag(newTag.trim())}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                
                {/* Available Tags */}
                <div className="flex flex-wrap gap-1">
                  {availableTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What's your post about?"
                maxLength={200}
                required
              />
              <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us more..."
                maxLength={5000}
                required
              />
              <p className="text-sm text-gray-500 mt-1">{content.length}/5000 characters</p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}