"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: "reply" | "mention" | "like"
  content: string
  createdAt: Date
  read: boolean
  link: string
  actor: {
    name: string
    image: string
  }
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In a real app, you would fetch notifications from your API
        // const response = await fetch("/api/notifications")
        // const data = await response.json()
        // setNotifications(data.notifications)

        // Mock data for demonstration
        setNotifications([
          {
            id: "1",
            type: "reply",
            content: "replied to your post",
            createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
            read: false,
            link: "/post/1",
            actor: {
              name: "Jane Smith",
              image: "/placeholder.svg?height=32&width=32",
            },
          },
          {
            id: "2",
            type: "mention",
            content: "mentioned you in a comment",
            createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            read: false,
            link: "/post/2",
            actor: {
              name: "John Doe",
              image: "/placeholder.svg?height=32&width=32",
            },
          },
          {
            id: "3",
            type: "like",
            content: "liked your post",
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            read: true,
            link: "/post/1",
            actor: {
              name: "Alice Johnson",
              image: "/placeholder.svg?height=32&width=32",
            },
          },
        ])
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()
  }, [])

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((notification) => !notification.read).length)
  }, [notifications])

  // Mark notifications as read when opening the popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    if (newOpen && unreadCount > 0) {
      // In a real app, you would call your API to mark notifications as read
      // fetch("/api/notifications/mark-read", { method: "POST" })

      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      )

      setUnreadCount(0)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="text-sm font-medium">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className={cn(
                    "flex items-center gap-3 rounded-md p-2 hover:bg-muted",
                    !notification.read && "bg-muted/50",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <img
                    src={notification.actor.image || "/placeholder.svg"}
                    alt={notification.actor.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{notification.actor.name}</span> {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                </Link>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

