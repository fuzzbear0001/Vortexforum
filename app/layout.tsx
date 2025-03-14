import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modern Forum",
  description: "A simple forum application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b py-4">
          <div className="container">
            <h1 className="text-xl font-bold">Modern Forum</h1>
          </div>
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'