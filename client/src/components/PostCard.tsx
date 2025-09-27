"use client"

import { useState } from "react"
import VoteButtons from "./VoteButtons"

interface Post {
  id: number
  title: string
  content: string
  username: string
  score: number
  user_vote?: number
  created_at: string
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post: initialPost }: PostCardProps) {
  const [post, setPost] = useState(initialPost)

  const handleVoteChange = (newScore: number, newUserVote: number | null) => {
    setPost((prev) => ({
      ...prev,
      score: newScore,
      user_vote: newUserVote || undefined,
    }))
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

  const formatContent = (content: string) => {
    // Simple formatting: preserve line breaks and limit length for preview
    const maxLength = 500
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength) + "..."
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="flex p-4">
        {/* Voting section */}
        <div className="mr-4">
          <VoteButtons postId={post.id} score={post.score} userVote={post.user_vote} onVoteChange={handleVoteChange} />
        </div>

        {/* Post content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span className="font-medium">u/{post.username}</span>
            <span className="mx-1">•</span>
            <span>{formatDate(post.created_at)}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{post.title}</h3>

          <div className="text-gray-700 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap break-words">{formatContent(post.content)}</p>
          </div>

          {/* Post actions */}
          <div className="flex items-center mt-3 space-x-4 text-xs text-gray-500">
            <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Comments</span>
            </button>

            <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
