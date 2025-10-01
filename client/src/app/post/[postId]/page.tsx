"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import CommentCard from "@/components/CommentCard"
import CommentForm from "@/components/CommentForm"
import { postsApi, commentsApi, votesApi, Post, Comment } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface PostDetailPageProps {
  params: Promise<{ postId: string }>
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState("")

  const unwrappedParams = use(params)

  useEffect(() => {
    loadPost()
    loadComments()
  }, [unwrappedParams.postId])

  const loadPost = async () => {
    try {
      setLoading(true)
      const postData = await postsApi.getById(parseInt(unwrappedParams.postId))
      setPost(postData)
    } catch (error) {
      console.error('Error loading post:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      setCommentsLoading(true)
      const commentsData = await commentsApi.getByPostId(parseInt(unwrappedParams.postId))
      setComments(commentsData)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleCommentSubmit = async (content: string) => {
    try {
      const newComment = await commentsApi.create({
        postId: parseInt(unwrappedParams.postId),
        content
      })
      setComments(prev => [...prev, newComment])
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  const handleCommentVote = async (commentId: number, newScore: number, newUserVote: number | null) => {
    try {
      // When removing a vote (newUserVote is null), we need to send the CURRENT vote value
      // to the backend to toggle it off
      const comment = comments.find(c => c.id === commentId)
      if (!comment) return
      
      const voteValueToSend = newUserVote !== null 
        ? newUserVote 
        : (comment.user_vote || 1) // Send current vote to remove it
      
      await votesApi.voteComment(commentId, voteValueToSend)
      
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, score: newScore, user_vote: newUserVote || undefined }
          : c
      ))
    } catch (error) {
      console.error('Error voting on comment:', error)
      // Revert optimistic update on error
      loadComments()
    }
  }

  const handleCommentDelete = async (commentId: number) => {
    try {
      await commentsApi.delete(commentId)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handlePostDelete = async (postId: number) => {
    try {
      await postsApi.delete(postId)
      router.push('/')
      setTimeout(() => router.refresh(), 100) 
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading post...</div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been deleted.</p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Post */}
      <div className="mb-8">
        <PostCard post={post} isDetailView={true} onDelete={handlePostDelete} />
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
        
        {/* Comment Form */}
        <CommentForm 
          postId={post.id} 
          onSubmit={handleCommentSubmit}
        />

        {/* Comments List */}
        {commentsLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading comments...</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-lg border">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onVoteChange={handleCommentVote}
                onDelete={handleCommentDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
