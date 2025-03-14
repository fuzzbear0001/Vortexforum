import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, "_")}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, filename)
    const publicPath = `/uploads/${filename}`

    // Ensure upload directory exists
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
    }

    return NextResponse.json({ url: publicPath })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

