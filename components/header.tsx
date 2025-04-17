"use client"

import { useState } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuth = () => {
    // Toggle login state for demo purposes
    setIsLoggedIn(!isLoggedIn)
  }

  return (
    <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between px-4">
        <h1 className="text-2xl font-bold tracking-tight">Journal Digitizer</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isLoggedIn ? (
              <>
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Account Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleAuth}>
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="cursor-pointer" onClick={handleAuth}>
                Log in
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
