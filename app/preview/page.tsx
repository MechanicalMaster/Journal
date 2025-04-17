"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Trash2, RotateCw, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PreviewScreen() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  // In a real app, you would receive the captured images from the previous screen
  // For now, we'll use a placeholder
  const placeholderImage = "/placeholder.svg?height=800&width=600"
  const totalPages = 1

  const goBack = () => {
    router.push("/new-entry")
  }

  const proceedToExtract = () => {
    // In a real app, you would process and save the images here
    router.push("/extract")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
            <h1 className="ml-4 text-xl font-semibold">Preview</h1>
          </div>
          <Button onClick={proceedToExtract}>
            <Check className="mr-2 h-5 w-5" />
            Extract Text
          </Button>
        </div>
      </header>

      <main className="flex-1 container p-4 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md aspect-[3/4] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <img
            src={placeholderImage || "/placeholder.svg"}
            alt={`Preview of page ${currentPage}`}
            className="w-full h-full object-contain"
          />

          {totalPages > 1 && (
            <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
              {currentPage} / {totalPages}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <Button variant="outline" size="icon">
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
          <Button variant="outline" size="icon">
            <RotateCw className="h-5 w-5" />
            <span className="sr-only">Rotate</span>
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn className="h-5 w-5" />
            <span className="sr-only">Zoom</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
