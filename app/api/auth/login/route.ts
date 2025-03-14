import { NextResponse } from "next/server"
import { z } from "zod"

import { authenticateUser, generateAuthToken, setAuthCookie } from "@/lib/auth"

// Define validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  rememberMe: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { email, rememberMe } = result.data

    // Authenticate user
    const user = await authenticateUser(email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Generate token and set cookie
    const token = generateAuthToken(user, rememberMe)
    setAuthCookie(token, rememberMe)

    return NextResponse.json({
      message: "Login successful",
      user: user,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

