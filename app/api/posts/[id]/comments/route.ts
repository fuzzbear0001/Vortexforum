import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Define validation schema
const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = commentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { content } = result.data
    const postId = params.id

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId,
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

    // Create notification for post author if it's not the same user
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "comment",
          content: "commented on your post",
          userId: post.authorId,
          actorId: user.id,
          postId,
          commentId: comment.id,
        },
      })
    }

    // Transform the comment to match the expected format
    const transformedComment = {
      ...comment,
      _count: {
        likes: comment._count.commentVotes,
      },
    }

    return NextResponse.json({ message: "Comment created successfully", comment: transformedComment }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

