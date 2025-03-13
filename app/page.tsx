import Link from "next/link"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/lib/data"

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Forum Feed</h1>
        <Link href="/create">
          <Button>Create Post</Button>
        </Link>
      </div>
      <div className="mt-8 flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

