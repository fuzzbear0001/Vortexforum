"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Reply } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { VoteButtons } from "@/components/vote-buttons"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string
    image: string
  }
  _count: {
    likes: number
  }
  replies?: Comment[]
  votes?: number
  userVote?: "up" | "down" | null
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments || [])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to post comment")
      }

      const data = await response.json()

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })

      setNewComment("")
      setComments([data.comment, ...comments])
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to post reply")
      }

      const data = await response.json()

      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      })

      setReplyContent("")
      setReplyingTo(null)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  const toggleReplyForm = (commentId: string | null) => {
    setReplyingTo(commentId)
    setReplyContent("")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Comments</h2>

      <div className="space-y-4">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-y"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()} className="gradient-bg">
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="rounded-lg border p-4 gradient-border">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage
                      src={
                        comment.author.image || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author.name}`
                      }
                      alt={comment.author.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {comment.author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{comment.author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm">{comment.content}</p>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <VoteButtons
                    itemId={comment.id}
                    itemType="comment"
                    initialVotes={comment.votes || 0}
                    initialVote={comment.userVote}
                    orientation="horizontal"
                    size="sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 px-2"
                    onClick={() => toggleReplyForm(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>

                  {comment.replies && comment.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 px-2"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      <span>
                        {expandedReplies[comment.id] ? "Hide" : "Show"} {comment.replies.length}{" "}
                        {comment.replies.length === 1 ? "reply" : "replies"}
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              {replyingTo === comment.id && (
                <div className="ml-8 space-y-4">
                  <Textarea
                    placeholder={`Reply to ${comment.author.name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] resize-y"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => toggleReplyForm(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                      className="gradient-bg"
                    >
                      {isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              )}

              {expandedReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg border p-4 gradient-border">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                          <AvatarImage
                            src={
                              reply.author.image ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${reply.author.name}`
                            }
                            alt={reply.author.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {reply.author.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{reply.author.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm">{reply.content}</p>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <VoteButtons
                          itemId={reply.id}
                          itemType="comment"
                          initialVotes={reply.votes || 0}
                          initialVote={reply.userVote}
                          orientation="horizontal"
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}

