"use client"

import { useState } from "react"

interface VoteButtonsProps {
  postId: number
  score: number
  userVote?: number
  onVoteChange?: (newScore: number, newUserVote: number | null) => void
}

export default function VoteButtons({
  postId,
  score: initialScore,
  userVote: initialUserVote,
  onVoteChange,
}: VoteButtonsProps) {
  // Fake auth: hardcode a logged-in user
  const user = { username: "EmilyQ" } // set to null to simulate logged out

  // Local state for score + userVote
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<number | null>(initialUserVote || null)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value: number) => {
    if (!user) return // require login

    setLoading(true)
    try {
      // Toggle vote if clicking same button
      const newValue = userVote === value ? null : value

      // Compute new score based on action
      let newScore = score
      if (userVote === value) {
        // Removing existing vote
        newScore -= value
      } else {
        // Switching or adding new vote
        newScore += newValue! - (userVote || 0)
      }

      // Update local state
      setScore(newScore)
      setUserVote(newValue)

      // Notify parent if needed
      onVoteChange?.(newScore, newValue)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={!user || loading}
        className={`p-1 rounded transition-colors ${
          userVote === 1
            ? "text-orange-500 bg-orange-50"
            : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
        } ${!user ? "cursor-not-allowed opacity-50" : ""} ${loading ? "opacity-50" : ""}`}
        title={!user ? "Login to vote" : userVote === 1 ? "Remove upvote" : "Upvote"}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Score */}
      <span
        className={`text-sm font-medium transition-colors ${
          score > 0 ? "text-orange-500" : score < 0 ? "text-blue-500" : "text-gray-500"
        }`}
      >
        {score}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={!user || loading}
        className={`p-1 rounded transition-colors ${
          userVote === -1
            ? "text-blue-500 bg-blue-50"
            : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
        } ${!user ? "cursor-not-allowed opacity-50" : ""} ${loading ? "opacity-50" : ""}`}
        title={!user ? "Login to vote" : userVote === -1 ? "Remove downvote" : "Downvote"}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
