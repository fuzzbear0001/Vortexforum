import { prisma } from "@/lib/prisma"

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
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
    return posts.map((post) => ({
      ...post,
      _count: {
        comments: 0,
        likes: 0,
      },
      votes: 0,
    }))
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export async function getPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) return null

    // Transform the post to match the expected format
    return {
      ...post,
      _count: {
        comments: 0,
        likes: 0,
      },
      votes: 0,
      comments: [],
    }
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { name: username },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
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
    return posts.map((post) => ({
      ...post,
      _count: {
        comments: 0,
        likes: 0,
      },
      votes: 0,
    }))
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return []
  }
}

export async function getUserComments(userId: string) {
  // Since we don't have comments table yet, return empty array
  return []
}

