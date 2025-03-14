"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface VoteButtonsProps {
  itemId: string
  itemType: "post" | "comment"
  initialVotes: number
  initialVote?: "up" | "down" | null
  orientation?: "vertical" | "horizontal"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function VoteButtons({
  itemId,
  itemType,
  initialVotes = 0,
  initialVote = null,
  orientation = "vertical",
  size = "md",
  className,
}: VoteButtonsProps) {
  const router = useRouter()
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialVote)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (voteType: "up" | "down") => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // If user clicks the same vote type again, remove their vote
      if (userVote === voteType) {
        // In a real app, you would call your API to remove the vote
        const response = await fetch(`/api/${itemType}s/${itemId}/vote`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to remove vote")
        }

        setVotes(votes - (voteType === "up" ? 1 : -1))
        setUserVote(null)

        toast({
          title: "Vote removed",
          description: `Your vote has been removed.`,
        })
      } else {
        // Calculate vote change
        let voteChange = 0
        if (userVote === null) {
          voteChange = voteType === "up" ? 1 : -1
        } else {
          // Switching from downvote to upvote or vice versa (counts double)
          voteChange = voteType === "up" ? 2 : -2
        }

        const response = await fetch(`/api/${itemType}s/${itemId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to record vote")
        }

        setVotes(votes + voteChange)
        setUserVote(voteType)

        toast({
          title: `${voteType === "up" ? "Upvoted" : "Downvoted"}`,
          description: `Your vote has been recorded.`,
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: {
      button: "h-6 w-6",
      icon: "h-3 w-3",
      count: "text-xs",
    },
    md: {
      button: "h-8 w-8",
      icon: "h-4 w-4",
      count: "text-sm",
    },
    lg: {
      button: "h-10 w-10",
      icon: "h-5 w-5",
      count: "text-base",
    },
  }

  return (
    <div className={cn("flex items-center gap-1", orientation === "vertical" ? "flex-col" : "flex-row", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size].button,
          userVote === "up" && "text-primary bg-primary/10",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => handleVote("up")}
        disabled={isLoading}
        aria-label="Upvote"
      >
        <ChevronUp className={sizeClasses[size].icon} />
      </Button>

      <span
        className={cn(
          "font-medium tabular-nums",
          sizeClasses[size].count,
          votes > 0 ? "text-primary" : votes < 0 ? "text-destructive" : "",
        )}
      >
        {votes}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size].button,
          userVote === "down" && "text-destructive bg-destructive/10",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => handleVote("down")}
        disabled={isLoading}
        aria-label="Downvote"
      >
        <ChevronDown className={sizeClasses[size].icon} />
      </Button>
    </div>
  )
}

