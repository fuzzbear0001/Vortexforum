import Link from "next/link"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/lib/data"

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary opacity-10 blur-[80px]"></div>
      </div>
      <div className="container max-w-4xl py-6 lg:py-10">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text">
            Modern Forum
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Join the conversation in our sleek, modern community platform
          </p>
          <div className="mt-8">
            <Link href="/create">
              <Button size="lg" className="gradient-bg">
                Create Post
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}

