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
        _count: {
          select: {
            comments: true,
            postVotes: true,
          },
        },
      },
    })

    // Transform the posts to match the expected format
    return posts.map((post) => ({
      ...post,
      _count: {
        ...post._count,
        likes: post._count.postVotes,
      },
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
        comments: {
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
            _count: {
              select: {
                commentVotes: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            postVotes: true,
          },
        },
      },
    })

    if (!post) return null

    // Transform the post to match the expected format
    return {
      ...post,
      _count: {
        ...post._count,
        likes: post._count.postVotes,
      },
      comments: post.comments.map((comment) => ({
        ...comment,
        _count: {
          likes: comment._count.commentVotes,
        },
      })),
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
        reputation: true,
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
        _count: {
          select: {
            comments: true,
            postVotes: true,
          },
        },
      },
    })

    // Transform the posts to match the expected format
    return posts.map((post) => ({
      ...post,
      _count: {
        ...post._count,
        likes: post._count.postVotes,
      },
    }))
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return []
  }
}

export async function getUserComments(userId: string) {
  try {
    const comments = await prisma.comment.findMany({
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
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            commentVotes: true,
          },
        },
      },
    })

    // Transform the comments to match the expected format
    return comments.map((comment) => ({
      ...comment,
      _count: {
        likes: comment._count.commentVotes,
      },
    }))
  } catch (error) {
    console.error("Error fetching user comments:", error)
    return []
  }
}

