import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { getPostById } from "@/lib/data"

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostById(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400 via-indigo-400 to-indigo-800 opacity-10 dark:opacity-20"></div>

      {/* Animated shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-600 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>
      </div>

      <div className="container max-w-4xl py-12">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            <div className="mt-4 flex items-center gap-4">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage
                  src={post.author.image || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author.name}`}
                  alt={post.author.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden p-6 border-none bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
            <div className="prose max-w-none dark:prose-invert prose-headings:text-foreground">
              {post.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Card>

          <Separator />

          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Comments</h2>

            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4">Comments are currently disabled.</p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled
              >
                Comments coming soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

