"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Book, Home, Search, BookOpen, PenLine, Brain, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

const Sidebar = () => {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Book, label: "My Courses", path: "/courses" },
    { icon: PenLine, label: "Notes", path: "/notes" },
    { icon: BookOpen, label: "Study", path: "/study" },
    { icon: Brain, label: "Research", path: "/research" },
    { icon: Search, label: "Search", path: "/search" },
  ]

  return (
    <div className="h-screen w-64 bg-background border-r flex flex-col fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold">StudyHub</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start gap-2", pathname === item.path && "bg-accent")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
