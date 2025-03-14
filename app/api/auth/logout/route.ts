import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    cookies().delete("auth_token")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

