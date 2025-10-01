"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home"
    },
    {
      href: "/explore",
      icon: Compass,
      label: "Explore"
    },
    {
      href: "/courses",
      icon: GraduationCap,
      label: "Your Courses"
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="flex flex-col items-center justify-center h-12 w-16 p-0"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
