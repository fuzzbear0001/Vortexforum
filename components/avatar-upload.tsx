"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface AvatarUploadProps {
  value: string
  onChange: (url: string) => void
}

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload the file to your server or a storage service
    // For this demo, we'll just create a local object URL
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    onChange(objectUrl)
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {preview ? (
        <div className="relative">
          <Avatar className="h-24 w-24 cursor-pointer" onClick={triggerFileInput}>
            <AvatarImage src={preview} alt="Avatar" />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground bg-muted"
          onClick={triggerFileInput}
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

