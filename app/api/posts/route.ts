import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Define validation schema
const postSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must be at most 100 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const posts = await prisma.post.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Transform the posts to match the expected format
    const transformedPosts = posts.map((post) => ({
      ...post,
      _count: {
        comments: 0,
        likes: 0,
      },
      votes: 0,
    }))

    const totalPosts = await prisma.post.count()

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
        current: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = postSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { title, content } = result.data

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          ...post,
          _count: {
            comments: 0,
            likes: 0,
          },
          votes: 0,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

