"use client"

import { useState, useCallback, useEffect } from "react"
import { Bold, Code, Italic, Link, List, ListOrdered, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  isPreview?: boolean
}

export function RichTextEditor({ value, onChange, isPreview = false }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write")

  useEffect(() => {
    if (isPreview) {
      setActiveTab("preview")
    } else {
      setActiveTab("write")
    }
  }, [isPreview])

  const insertFormat = useCallback(
    (format: string) => {
      const textarea = document.querySelector("textarea")
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      let replacement = ""

      switch (format) {
        case "bold":
          replacement = `**${selectedText || "bold text"}**`
          break
        case "italic":
          replacement = `*${selectedText || "italic text"}*`
          break
        case "code":
          replacement = `\`\`\`\n${selectedText || "code block"}\n\`\`\``
          break
        case "link":
          replacement = `[${selectedText || "link text"}](url)`
          break
        case "list":
          replacement = `\n- ${selectedText || "list item"}\n- another item\n`
          break
        case "ordered-list":
          replacement = `\n1. ${selectedText || "list item"}\n2. another item\n`
          break
        case "image":
          replacement = `![${selectedText || "alt text"}](image-url)`
          break
        default:
          return
      }

      const newValue = value.substring(0, start) + replacement + value.substring(end)
      onChange(newValue)

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + replacement.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [value, onChange],
  )

  const handleImageUpload = useCallback(() => {
    // In a real app, you would implement file upload functionality
    toast({
      title: "Image upload",
      description: "This would open a file picker in a real application.",
    })
    insertFormat("image")
  }, [insertFormat])

  const renderMarkdown = (text: string) => {
    // This is a very simple markdown renderer for demo purposes
    // In a real app, you would use a proper markdown library like marked or remark
    const html = text
      // Code blocks
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Links
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" class="text-primary underline">$1</a>')
      // Lists
      .replace(/^\s*-\s+(.*?)$/gm, "<li>$1</li>")
      .replace(/<li>.*?<\/li>/gs, '<ul class="list-disc pl-6">$&</ul>')
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*?)$/gm, "<li>$1</li>")
      .replace(/<li>.*?<\/li>/gs, '<ol class="list-decimal pl-6">$&</ol>')
      // Images
      .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" class="my-4 rounded-md" />')
      // Paragraphs
      .replace(/^(?!<[uo]l|<pre|<img)(.*?)$/gm, '<p class="mb-4">$1</p>')

    return html
  }

  return (
    <div className="rounded-md border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList className="grid w-full max-w-[200px] grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {activeTab === "write" && (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => insertFormat("bold")} title="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => insertFormat("italic")} title="Italic">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => insertFormat("code")} title="Code">
                <Code className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => insertFormat("link")} title="Link">
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => insertFormat("list")} title="Bullet List">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => insertFormat("ordered-list")} title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleImageUpload} title="Image">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="write" className="p-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your content here using Markdown..."
            className="min-h-[300px] resize-y rounded-none border-0 p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4">
          {value ? (
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <p className="text-muted-foreground">Nothing to preview</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

