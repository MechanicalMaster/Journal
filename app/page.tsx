"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Book, Settings, List, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {!isOnline && (
          <div className="flex items-center justify-center p-4 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
            <WifiOff className="h-5 w-5 mr-2" />
            <p>Connect to the internet to digitize entries.</p>
          </div>
        )}

        <div className="grid gap-6 w-full max-w-md">
          <Button
            size="lg"
            className="h-24 text-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            onClick={() => router.push("/new-entry")}
            disabled={!isOnline}
          >
            <Book className="mr-2 h-6 w-6" />
            New Entry
          </Button>

          <Button
            size="lg"
            className="h-24 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => router.push("/entries")}
          >
            <List className="mr-2 h-6 w-6" />
            View Entries
          </Button>

          <Button
            size="lg"
            className="h-24 text-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-6 w-6" />
            Settings
          </Button>
        </div>
      </main>

      <Footer isOnline={isOnline} />
    </div>
  )
}
