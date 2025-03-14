import { cookies } from "next/headers"
import { verify, sign } from "jsonwebtoken"
import { compare, hash } from "bcrypt"

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

export async function authenticateUser(email: string, password: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.password) {
    return null
  }

  // Verify password
  const passwordMatch = await compare(password, user.password)
  if (!passwordMatch) {
    return null
  }

  return user
}

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export function generateAuthToken(user: { id: string; email: string }, rememberMe = false) {
  return sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: rememberMe ? "30d" : "1d",
  })
}

export function setAuthCookie(token: string, rememberMe = false) {
  cookies().set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day in seconds
  })
}

