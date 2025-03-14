"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Share2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { VoteButtons } from "@/components/vote-buttons"
import { toast } from "@/components/ui/use-toast"

interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string
    image: string
  }
  _count: {
    comments: number
    likes: number
  }
  votes?: number
  userVote?: "up" | "down" | null
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)

    // Call the API to update the like status
    fetch(`/api/posts/${post.id}/like`, {
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      console.error("Error updating like status:", error)
      // Revert the UI state if the API call fails
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1)
      setIsLiked(!isLiked)
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      })
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    })
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md gradient-border">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={post.author.image} alt={post.author.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {post.author.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <Link
            href={`/profile/${post.author.name}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {post.author.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <Link href={`/post/${post.id}`}>
        <CardContent className="p-4 pt-0">
          <h3 className="mb-2 text-xl font-bold tracking-tight">{post.title}</h3>
          <div className="line-clamp-3 text-muted-foreground">{post.content}</div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="flex items-center gap-6">
          <VoteButtons
            itemId={post.id}
            itemType="post"
            initialVotes={post.votes || 0}
            initialVote={post.userVote}
            orientation="horizontal"
            size="sm"
          />
          <Link href={`/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
              <MessageCircle className="h-4 w-4" />
              <span>{post._count.comments}</span>
            </Button>
          </Link>
        </div>
        <Button variant="ghost" size="sm" className="px-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

