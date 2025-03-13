import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import { getUserByUsername, getUserPosts, getUserComments } from "@/lib/data"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUserByUsername(params.username)

  if (!user) {
    notFound()
  }

  const posts = await getUserPosts(user.id)
  const comments = await getUserComments(user.id)

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <Card className="p-6 mb-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || "/placeholder.svg?height=96&width=96"} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">
              Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{comments.length}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{user.reputation || 0}</p>
                <p className="text-sm text-muted-foreground">Reputation</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Edit Profile</Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No posts yet</h3>
              <p className="mt-2 text-muted-foreground">{user.name} hasn't created any posts yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-muted-foreground">
                      On{" "}
                      <a href={`/post/${comment.postId}`} className="font-medium text-primary hover:underline">
                        {comment.post.title}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No comments yet</h3>
              <p className="mt-2 text-muted-foreground">{user.name} hasn't commented on any posts yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

