import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Define validation schema
const voteSchema = z.object({
  voteType: z.enum(["up", "down"]),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = voteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { voteType } = result.data
    const commentId = params.id

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user has already voted on this comment
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    })

    if (existingVote) {
      // Update existing vote
      await prisma.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          type: voteType,
        },
      })
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          type: voteType,
          userId: user.id,
          commentId,
        },
      })
    }

    // Calculate new vote count
    const upvotes = await prisma.vote.count({
      where: {
        commentId,
        type: "up",
      },
    })

    const downvotes = await prisma.vote.count({
      where: {
        commentId,
        type: "down",
      },
    })

    const voteCount = upvotes - downvotes

    // Update comment reputation
    await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        votes: voteCount,
      },
    })

    // Update author reputation
    await prisma.user.update({
      where: {
        id: comment.authorId,
      },
      data: {
        reputation: {
          increment: voteType === "up" ? 1 : -1,
        },
      },
    })

    return NextResponse.json({
      message: "Vote recorded successfully",
      votes: voteCount,
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const commentId = params.id

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user has voted on this comment
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    })

    if (!existingVote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 })
    }

    // Store vote type before deletion for reputation adjustment
    const voteType = existingVote.type

    // Delete vote
    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    })

    // Calculate new vote count
    const upvotes = await prisma.vote.count({
      where: {
        commentId,
        type: "up",
      },
    })

    const downvotes = await prisma.vote.count({
      where: {
        commentId,
        type: "down",
      },
    })

    const voteCount = upvotes - downvotes

    // Update comment reputation
    await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        votes: voteCount,
      },
    })

    // Update author reputation
    await prisma.user.update({
      where: {
        id: comment.authorId,
      },
      data: {
        reputation: {
          decrement: voteType === "up" ? 1 : -1,
        },
      },
    })

    return NextResponse.json({
      message: "Vote removed successfully",
      votes: voteCount,
    })
  } catch (error) {
    console.error("Error removing vote:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

