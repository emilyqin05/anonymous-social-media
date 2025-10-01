"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface CommentFormProps {
  postId: number
  onSubmit: (content: string) => void
  loading?: boolean
}

export default function CommentForm({ postId, onSubmit, loading = false }: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && user) {
      onSubmit(content.trim())
      setContent("")
    }
  }

  if (!user) {
    return (
      <div className="bg-card rounded-lg border p-4 text-center">
        <p className="text-muted-foreground">Please log in to comment</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-4">
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are your thoughts?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
          maxLength={1000}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">{content.length}/1000 characters</p>
      </div>
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!content.trim() || loading}
          size="sm"
        >
          {loading ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  )
}
