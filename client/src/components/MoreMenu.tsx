"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Flag } from "lucide-react"

interface MenuItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive"
}

interface MoreMenuProps {
  items: MenuItem[]
  className?: string
}

export default function MoreMenu({ items, className = "" }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick()
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                  item.variant === "destructive" ? "text-red-600 hover:text-red-700" : "text-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
