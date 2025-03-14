import Link from "next/link"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/lib/data"

export default async function Home() {
  const posts = await getPosts()

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
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Modern Forum
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Join the conversation in our sleek, modern community platform
          </p>
          <div className="mt-8">
            <Link href="/create">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
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

