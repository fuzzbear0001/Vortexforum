import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || "fallback_secret") as {
      id: string
      email: string
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

