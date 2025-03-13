"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

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
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialVote)

  const handleVote = async (voteType: "up" | "down") => {
    // If user clicks the same vote type again, remove their vote
    if (userVote === voteType) {
      try {
        // In a real app, you would call your API to remove the vote
        // await fetch(`/api/${itemType}s/${itemId}/vote`, {
        //   method: "DELETE",
        // })

        setVotes(votes - (voteType === "up" ? 1 : -1))
        setUserVote(null)

        toast({
          title: "Vote removed",
          description: `Your vote has been removed.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove vote. Please try again.",
          variant: "destructive",
        })
      }
      return
    }

    // Calculate vote change
    let voteChange = 0
    if (userVote === null) {
      voteChange = voteType === "up" ? 1 : -1
    } else {
      // Switching from downvote to upvote or vice versa (counts double)
      voteChange = voteType === "up" ? 2 : -2
    }

    try {
      // In a real app, you would call your API to add/update the vote
      // await fetch(`/api/${itemType}s/${itemId}/vote`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ voteType }),
      // })

      setVotes(votes + voteChange)
      setUserVote(voteType)

      toast({
        title: `${voteType === "up" ? "Upvoted" : "Downvoted"}`,
        description: `Your vote has been recorded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      })
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
        className={cn(sizeClasses[size].button, userVote === "up" && "text-primary bg-primary/10")}
        onClick={() => handleVote("up")}
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
        className={cn(sizeClasses[size].button, userVote === "down" && "text-destructive bg-destructive/10")}
        onClick={() => handleVote("down")}
        aria-label="Downvote"
      >
        <ChevronDown className={sizeClasses[size].icon} />
      </Button>
    </div>
  )
}

