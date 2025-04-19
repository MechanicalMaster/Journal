"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Trash2, RotateCw, ZoomIn, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function PreviewScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [processedImages, setProcessedImages] = useState<string[]>([])

  // In a real app, we would get this from localStorage or app state
  const placeholderImage = "/placeholder.svg?height=800&width=600"

  // Get the captured images from localStorage
  useEffect(() => {
    const storedImages = localStorage.getItem('capturedImages')
    if (storedImages) {
      const images = JSON.parse(storedImages)
      setProcessedImages(images)
      if (images.length > 0) {
        setImage(images[0])
      }
    }
  }, [])

  const goBack = () => {
    router.push("/new-entry")
  }

  const proceedToExtract = async () => {
    if (processedImages.length === 0) {
      toast({
        title: "No images to process",
        description: "Please go back and capture at least one image first.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Store all images in localStorage for the extract page to use
      localStorage.setItem('capturedImages', JSON.stringify(processedImages))
      
      // Store the current image for backward compatibility
      localStorage.setItem('currentImage', processedImages[0])
      
      // Navigate to extract page
      router.push("/extract")
    } catch (error) {
      console.error('Error preparing images for processing:', error)
      toast({
        title: "Processing Failed",
        description: "There was an error preparing your images. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleDeleteImage = () => {
    // Remove current image
    if (processedImages.length > 0) {
      const newImages = [...processedImages]
      newImages.splice(currentPage - 1, 1)
      setProcessedImages(newImages)
      localStorage.setItem('capturedImages', JSON.stringify(newImages))
      
      if (newImages.length === 0) {
        setImage(null)
        router.push("/new-entry")
      } else {
        setImage(newImages[Math.min(currentPage - 1, newImages.length - 1)])
        if (currentPage > newImages.length) {
          setCurrentPage(newImages.length)
        }
      }
    }
  }

  const handleRotateImage = () => {
    // Just a placeholder for image rotation functionality
    toast({
      title: "Rotate Image",
      description: "Image rotation functionality would be implemented here.",
    })
  }

  const handleZoomImage = () => {
    // Just a placeholder for image zoom functionality
    toast({
      title: "Zoom Image",
      description: "Image zoom functionality would be implemented here.",
    })
  }
  
  // Image navigation functions
  const nextImage = () => {
    if (currentPage < processedImages.length) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      setImage(processedImages[nextPage - 1])
    }
  }

  const prevImage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      setImage(processedImages[prevPage - 1])
    }
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
          <Button 
            onClick={proceedToExtract} 
            disabled={isProcessing || processedImages.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                {processedImages.length > 1 ? 'Extract Text (All Pages)' : 'Extract Text'}
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 container p-4 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md aspect-[3/4] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <img
            src={image || placeholderImage}
            alt={`Preview of page ${currentPage}`}
            className="w-full h-full object-contain"
          />

          {processedImages.length > 1 && (
            <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
              {currentPage} / {processedImages.length}
            </div>
          )}
        </div>

        {/* Image navigation controls */}
        {processedImages.length > 1 && (
          <div className="flex justify-center mt-4 space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevImage} 
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous Image</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={nextImage} 
              disabled={currentPage >= processedImages.length}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next Image</span>
            </Button>
          </div>
        )}

        <div className="flex justify-center mt-6 space-x-4">
          <Button variant="outline" size="icon" onClick={handleDeleteImage} disabled={!image}>
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleRotateImage} disabled={!image}>
            <RotateCw className="h-5 w-5" />
            <span className="sr-only">Rotate</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomImage} disabled={!image}>
            <ZoomIn className="h-5 w-5" />
            <span className="sr-only">Zoom</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
