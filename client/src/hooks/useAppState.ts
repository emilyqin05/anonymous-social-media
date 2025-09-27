"use client"

import { useState } from "react"

export interface Post {
  id: number
  title: string
  content: string
  author: string
  score: number
  userVote: number | null
  createdAt: string
  courseId?: string
  professor?: string
  tags: string[]
}

export interface Course {
  id: string
  name: string
  code: string
  professors: string[]
  description: string
  followerCount: number
}

export interface AppState {
  posts: Post[]
  courses: Course[]
  followedCourses: string[]
  followedTags: string[]
  professorPreferences: Record<string, string>
}

// Hardcoded data
const initialPosts: Post[] = [
  {
    id: 1,
    title: "Tips for CS 101 Final Exam",
    content: "Here are some study tips that helped me ace the final...",
    author: "student123",
    score: 15,
    userVote: null,
    createdAt: "2024-01-15T10:30:00Z",
    courseId: "cs101",
    professor: "Dr. Smith",
    tags: ["study-tips", "finals"],
  },
  {
    id: 2,
    title: "Math 201 Homework Help",
    content: "Can someone explain problem 3.4? I'm stuck on the integration part.",
    author: "mathstudent",
    score: 8,
    userVote: null,
    createdAt: "2024-01-14T15:45:00Z",
    courseId: "math201",
    professor: "Prof. Johnson",
    tags: ["homework", "help"],
  },
  {
    id: 3,
    title: "Best Study Spots on Campus",
    content: "The library's third floor is amazing for group study sessions!",
    author: "campusexplorer",
    score: 23,
    userVote: null,
    createdAt: "2024-01-13T09:15:00Z",
    tags: ["campus", "study-spots"],
  },
  {
    id: 4,
    title: "Physics 301 Lab Report Guidelines",
    content: "Professor Wilson shared these formatting requirements...",
    author: "physicsTA",
    score: 12,
    userVote: null,
    createdAt: "2024-01-12T14:20:00Z",
    courseId: "phys301",
    professor: "Prof. Wilson",
    tags: ["lab-reports", "guidelines"],
  },
]

const initialCourses: Course[] = [
  {
    id: "cs101",
    name: "Introduction to Computer Science",
    code: "CS 101",
    professors: ["Dr. Smith", "Prof. Davis"],
    description: "Fundamentals of programming and computer science concepts",
    followerCount: 245,
  },
  {
    id: "math201",
    name: "Calculus II",
    code: "MATH 201",
    professors: ["Prof. Johnson", "Dr. Lee"],
    description: "Integration techniques and applications",
    followerCount: 189,
  },
  {
    id: "phys301",
    name: "Advanced Physics",
    code: "PHYS 301",
    professors: ["Prof. Wilson"],
    description: "Quantum mechanics and modern physics",
    followerCount: 67,
  },
  {
    id: "eng102",
    name: "English Composition",
    code: "ENG 102",
    professors: ["Dr. Brown", "Prof. Taylor"],
    description: "Advanced writing and critical thinking",
    followerCount: 156,
  },
]

export function useAppState() {
  const [state, setState] = useState<AppState>({
    posts: initialPosts,
    courses: initialCourses,
    followedCourses: ["cs101", "math201"],
    followedTags: ["study-tips", "campus"],
    professorPreferences: {
      cs101: "Dr. Smith",
      math201: "Prof. Johnson",
    },
  })

  const toggleCourseFollow = (courseId: string) => {
    setState((prev) => ({
      ...prev,
      followedCourses: prev.followedCourses.includes(courseId)
        ? prev.followedCourses.filter((id) => id !== courseId)
        : [...prev.followedCourses, courseId],
    }))
  }

  const toggleTagFollow = (tag: string) => {
    setState((prev) => ({
      ...prev,
      followedTags: prev.followedTags.includes(tag)
        ? prev.followedTags.filter((t) => t !== tag)
        : [...prev.followedTags, tag],
    }))
  }

  const setProfessorPreference = (courseId: string, professor: string) => {
    setState((prev) => ({
      ...prev,
      professorPreferences: {
        ...prev.professorPreferences,
        [courseId]: professor,
      },
    }))
  }

  const voteOnPost = (postId: number, voteType: number) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => {
        if (post.id === postId) {
          const oldVote = post.userVote || 0
          const newVote = post.userVote === voteType ? 0 : voteType
          const scoreDiff = newVote - oldVote

          return {
            ...post,
            score: post.score + scoreDiff,
            userVote: newVote === 0 ? null : newVote,
          }
        }
        return post
      }),
    }))
  }

  const addPost = (post: Omit<Post, "id" | "score" | "userVote" | "createdAt">) => {
    const newPost: Post = {
      ...post,
      id: Math.max(...state.posts.map((p) => p.id)) + 1,
      score: 1,
      userVote: 1,
      createdAt: new Date().toISOString(),
    }

    setState((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
    }))
  }

  return {
    ...state,
    toggleCourseFollow,
    toggleTagFollow,
    setProfessorPreference,
    voteOnPost,
    addPost,
  }
}
