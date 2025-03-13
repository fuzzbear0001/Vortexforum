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
    const postId = params.id

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user has already voted on this post
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
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
          postId,
        },
      })
    }

    // Calculate new vote count
    const upvotes = await prisma.vote.count({
      where: {
        postId,
        type: "up",
      },
    })

    const downvotes = await prisma.vote.count({
      where: {
        postId,
        type: "down",
      },
    })

    const voteCount = upvotes - downvotes

    // Update post reputation
    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        votes: voteCount,
      },
    })

    // Update author reputation
    await prisma.user.update({
      where: {
        id: post.authorId,
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

    const postId = params.id

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user has voted on this post
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
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
        postId,
        type: "up",
      },
    })

    const downvotes = await prisma.vote.count({
      where: {
        postId,
        type: "down",
      },
    })

    const voteCount = upvotes - downvotes

    // Update post reputation
    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        votes: voteCount,
      },
    })

    // Update author reputation
    await prisma.user.update({
      where: {
        id: post.authorId,
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

