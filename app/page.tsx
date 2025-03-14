import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  // Fetch posts directly here to avoid any potential issues
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Modern Forum</h1>
        <p className="text-muted-foreground mb-6">Join the conversation</p>
        <Link href="/create">
          <Button>Create Post</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/post/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Posted by {post.author.name} on {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{post.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 border rounded-lg">
            <p className="mb-4">No posts yet</p>
            <Link href="/create">
              <Button>Create the first post</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

