import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Define validation schema
const replySchema = z.object({
  content: z.string().min(1, { message: "Reply cannot be empty" }),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = replySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { content } = result.data
    const commentId = params.id

    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    })

    if (!parentComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Create reply (which is just another comment with a parentId)
    const reply = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId: parentComment.postId,
        parentId: commentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            commentVotes: true,
          },
        },
      },
    })

    // Create notification for comment author if it's not the same user
    if (parentComment.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "reply",
          content: "replied to your comment",
          userId: parentComment.authorId,
          actorId: user.id,
          postId: parentComment.postId,
          commentId: reply.id,
        },
      })
    }

    // Transform the reply to match the expected format
    const transformedReply = {
      ...reply,
      _count: {
        likes: reply._count.commentVotes,
      },
    }

    return NextResponse.json({ message: "Reply created successfully", reply: transformedReply }, { status: 201 })
  } catch (error) {
    console.error("Error creating reply:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

