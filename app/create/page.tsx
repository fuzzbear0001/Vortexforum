"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"

const postSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must be at most 100 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
})

type PostFormValues = z.infer<typeof postSchema>

export default function CreatePostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  async function onSubmit(data: PostFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create post")
      }

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      })

      // Redirect to the newly created post
      router.push(`/post/${responseData.post.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePreview = () => {
    setIsPreview(!isPreview)
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary opacity-10 blur-[80px]"></div>
      </div>
      <div className="container max-w-4xl py-6 lg:py-10">
        <Card className="gradient-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a new post</CardTitle>
            <CardDescription>Share your thoughts, questions, or ideas with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a descriptive title" {...field} className="text-lg font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value} onChange={field.onChange} isPreview={isPreview} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={togglePreview}>
                    {isPreview ? "Edit" : "Preview"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-bg" disabled={isLoading}>
                    {isLoading ? "Publishing..." : "Publish Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

