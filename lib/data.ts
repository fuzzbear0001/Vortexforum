// This file contains mock data functions that would normally fetch from a database

interface User {
  id: string
  name: string
  image: string
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: User
  _count: {
    likes: number
  }
  replies?: Comment[]
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  author: User
  _count: {
    comments: number
    likes: number
  }
  comments?: Comment[]
}

// Mock users
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Jane Smith",
    image: "/placeholder.svg?height=40&width=40",
  },
]

// Mock comments
const comments: Comment[] = [
  {
    id: "1",
    content: "This is a great post! Thanks for sharing.",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    author: users[1],
    _count: {
      likes: 5,
    },
    replies: [
      {
        id: "3",
        content: "I agree, very helpful information!",
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        author: users[0],
        _count: {
          likes: 2,
        },
      },
    ],
  },
  {
    id: "2",
    content: "I have a question about the second point you made. Could you elaborate more on that?",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    author: users[0],
    _count: {
      likes: 3,
    },
  },
]

// Mock posts
const posts: Post[] = [
  {
    id: "1",
    title: "Getting Started with Next.js and Tailwind CSS",
    content:
      "Next.js is a React framework that enables server-side rendering and static site generation. Tailwind CSS is a utility-first CSS framework that makes styling your applications a breeze.\n\n## Why Next.js?\n\nNext.js provides an excellent developer experience with features like:\n\n- **Server-side rendering**\n- **Static site generation**\n- **API routes**\n- **File-based routing**\n\n## Why Tailwind CSS?\n\nTailwind CSS allows you to build modern designs without leaving your HTML:\n\n- **Utility-first approach**\n- **Responsive design made easy**\n- **Dark mode support**\n- **Customizable design system**\n\n```js\n// Example Next.js API route\nexport default function handler(req, res) {\n  res.status(200).json({ name: 'John Doe' })\n}\n```\n\n![Next.js and Tailwind CSS](/placeholder.svg?height=300&width=600)",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    author: users[0],
    _count: {
      comments: 2,
      likes: 15,
    },
    comments: comments,
  },
  {
    id: "2",
    title: "Building a Modern Authentication System",
    content:
      "Authentication is a critical part of any web application. In this post, we'll explore how to build a secure authentication system using modern techniques.\n\n## Key Components\n\n1. **User registration**\n2. **Login and session management**\n3. **Password reset flow**\n4. **Account verification**\n\n## Security Best Practices\n\n- Always hash passwords\n- Implement rate limiting\n- Use HTTPS\n- Set secure cookies\n\n```js\n// Example password hashing\nimport bcrypt from 'bcrypt'\n\nasync function hashPassword(password) {\n  const salt = await bcrypt.genSalt(10)\n  return bcrypt.hash(password, salt)\n}\n```",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    author: users[1],
    _count: {
      comments: 0,
      likes: 8,
    },
    comments: [],
  },
  {
    id: "3",
    title: "Responsive Design Patterns for Modern Web Apps",
    content:
      "Creating responsive web applications is essential in today's multi-device world. Let's explore some effective design patterns.\n\n## Mobile-First Approach\n\nAlways design for mobile first, then expand to larger screens.\n\n## Fluid Layouts\n\nUse percentage-based widths instead of fixed pixels.\n\n## Media Queries\n\nImplement breakpoints for different screen sizes.\n\n## Flexible Images\n\nEnsure images scale properly across devices.\n\n```css\n/* Example responsive grid */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}\n```",
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    author: users[0],
    _count: {
      comments: 0,
      likes: 12,
    },
    comments: [],
  },
]

// Mock data functions
export async function getPosts(): Promise<Post[]> {
  // In a real app, this would fetch from a database
  return posts
}

export async function getPostById(id: string): Promise<Post | null> {
  // In a real app, this would fetch from a database
  const post = posts.find((p) => p.id === id)
  return post || null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  // In a real app, this would fetch from a database
  const user = users.find((u) => u.name.toLowerCase() === username.toLowerCase())
  if (!user) return null

  return {
    ...user,
    reputation: 42, // Mock reputation
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  // In a real app, this would fetch from a database
  return posts.filter((post) => post.author.id === userId)
}

export async function getUserComments(userId: string): Promise<any[]> {
  // In a real app, this would fetch from a database
  return comments
    .filter((comment) => comment.author.id === userId)
    .map((comment) => ({
      ...comment,
      postId: "1", // Mock post ID
      post: {
        id: "1",
        title: "Getting Started with Next.js and Tailwind CSS",
      },
    }))
}

