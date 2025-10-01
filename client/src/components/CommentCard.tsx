"use client"

import { useState } from "react"
import VoteButtons from "./VoteButtons"
import MoreMenu from "./MoreMenu"
import ConfirmDialog from "./ConfirmDialog"
import { Comment } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Trash2, Flag } from "lucide-react"

interface CommentCardProps {
  comment: Comment
  onVoteChange?: (commentId: number, newScore: number, newUserVote: number | null) => void
  onDelete?: (commentId: number) => void
}

export default function CommentCard({ comment: initialComment, onVoteChange, onDelete }: CommentCardProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState(initialComment)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleVoteChange = (newScore: number, newUserVote: number | null) => {
    setComment(prev => ({
      ...prev,
      score: newScore,
      user_vote: newUserVote || undefined,
    }))
    onVoteChange?.(comment.id, newScore, newUserVote)
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

  const isOwner = user?.username === comment.username

  const menuItems: Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive"
  }> = [
    {
      label: "Report",
      icon: <Flag className="h-4 w-4" />,
      onClick: () => {
        // TODO: Implement report functionality
        console.log("Report comment:", comment.id)
      }
    }
  ]

  if (isOwner) {
    menuItems.unshift({
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive"
    })
  }

  const handleDeleteConfirm = () => {
    onDelete?.(comment.id)
    setShowDeleteDialog(false)
  }

  return (
    <div className="bg-gray-50 rounded-lg border p-4">
      <div className="flex">
        {/* Voting section */}
        <div className="mr-4">
          <VoteButtons 
            commentId={comment.id} 
            score={comment.score} 
            userVote={comment.user_vote} 
            onVoteChange={handleVoteChange} 
          />
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <span className="font-medium">u/{comment.username}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(comment.created_at)}</span>
            </div>
            <MoreMenu items={menuItems} />
          </div>

          <div className="text-gray-700 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap break-words">{comment.content}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
