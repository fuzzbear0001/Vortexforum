import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { generateAuthToken, setAuthCookie } from "@/lib/auth"

// Define validation schema
const userSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { username, email } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name: username }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: username,
        email,
      },
    })

    // Generate token and set cookie
    const token = generateAuthToken(user)
    setAuthCookie(token)

    return NextResponse.json(
      { message: "User created successfully", user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        error: "Something went wrong while creating your account. Please try again.",
      },
      { status: 500 },
    )
  }
}

