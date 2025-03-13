import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CommentSection } from "@/components/comment-section"
import { VoteButtons } from "@/components/vote-buttons"
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
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.image || "/placeholder.svg?height=40&width=40"} alt={post.author.name} />
              <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden p-6">
          <div className="flex">
            <VoteButtons
              itemId={post.id}
              itemType="post"
              initialVotes={post.votes || 0}
              initialVote={post.userVote}
              className="mr-4"
            />
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />
          </div>
        </Card>

        <Separator />

        <CommentSection postId={post.id} comments={post.comments} />
      </div>
    </div>
  )
}

// Simple markdown renderer (same as in rich-text-editor.tsx)
function renderMarkdown(text: string) {
  const html = text
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" class="text-primary underline">$1</a>')
    .replace(/^\s*-\s+(.*?)$/gm, "<li>$1</li>")
    .replace(/<li>.*?<\/li>/gs, '<ul class="list-disc pl-6">$&</ul>')
    .replace(/^\s*\d+\.\s+(.*?)$/gm, "<li>$1</li>")
    .replace(/<li>.*?<\/li>/gs, '<ol class="list-decimal pl-6">$&</ol>')
    .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" class="my-4 rounded-md" />')
    .replace(/^(?!<[uo]l|<pre|<img)(.*?)$/gm, '<p class="mb-4">$1</p>')

  return html
}

