import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  // Fetch post directly here
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Link href="/">
        <Button variant="outline" className="mb-6">
          ← Back to posts
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Posted by {post.author.name} on {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

