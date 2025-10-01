"use client"

import { useState } from "react"

export interface Post {
  id: number
  title: string
  content: string
  username: string // Changed from 'author' to 'username'
  score: number
  user_vote?: number // Changed from 'userVote' to 'user_vote'
  created_at: string // Changed from 'createdAt' to 'created_at'
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
    username: "student123", // Changed from 'author'
    score: 15,
    user_vote: undefined, // Changed from 'userVote'
    created_at: "2024-01-15T10:30:00Z", // Changed from 'createdAt'
    courseId: "cmpt120",
    professor: "Dr. Brian Fraser",
    tags: ["study-tips", "finals"],
  },
  {
    id: 2,
    title: "Math 201 Homework Help",
    content: "Can someone explain problem 3.4? I'm stuck on the integration part.",
    username: "mathstudent",
    score: 8,
    user_vote: undefined,
    created_at: "2024-01-14T15:45:00Z",
    courseId: "math152",
    professor: "Prof. Jamie Mulholland'",
    tags: ["homework", "help"],
  },
  {
    id: 3,
    title: "Best Study Spots on Campus",
    content: "The library's third floor is amazing for group study sessions!",
    username: "campusexplorer",
    score: 23,
    user_vote: undefined,
    created_at: "2024-01-13T09:15:00Z",
    tags: ["campus", "study-spots"],
  },
  {
    id: 4,
    title: "Physics 301 Lab Report Guidelines",
    content: "Professor Wilson shared these formatting requirements...",
    username: "physicsTA",
    score: 12,
    user_vote: 5,
    created_at: "2024-01-12T14:20:00Z",
    courseId: "phys301",
    professor: "Prof. Wilson",
    tags: ["lab-reports", "guidelines"],
  },
]

const initialCourses: Course[] = [
  {
    id: "cmpt120",
    name: "System Design and Programming",
    code: "CS 101",
    professors: ["Dr. Brian Fraser", "Prof. Davis"],
    description: "Fundamentals of programming and computer science concepts",
    followerCount: 245,
  },
  {
    id: "math152",
    name: "Calculus I",
    code: "MATH 201",
    professors: ["Prof. Jamie Mulholland'", "Dr. Lee"],
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
    followedCourses: ["cmpt120", "math152"],
    followedTags: ["study-tips", "campus"],
    professorPreferences: {
      cmpt120: "Dr. Brian Fraser",
      math152: "Prof. Jamie Mulholland'",
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
          const oldVote = post.user_vote || 0 // Changed from 'userVote'
          const newVote = post.user_vote === voteType ? 0 : voteType
          const scoreDiff = newVote - oldVote

          return {
            ...post,
            score: post.score + scoreDiff,
            user_vote: newVote === 0 ? undefined : newVote, // Changed from 'userVote'
          }
        }
        return post
      }),
    }))
  }

  const addPost = (post: Omit<Post, "id" | "score" | "user_vote" | "created_at">) => {
    const newPost: Post = {
      ...post,
      id: Math.max(...state.posts.map((p) => p.id)) + 1,
      score: 1,
      user_vote: 1, // Changed from 'userVote'
      created_at: new Date().toISOString(), // Changed from 'createdAt'
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