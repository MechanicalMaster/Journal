"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Trash2, RotateCw, ZoomIn, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { journalService } from "@/lib/journal-service"
import { JournalEntry } from "@/lib/db"

export default function PreviewScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [tempEntryId, setTempEntryId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [processedImages, setProcessedImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const placeholderImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

  useEffect(() => {
    const entryId = searchParams.get('entryId')
    if (!entryId) {
      toast({ title: "Error", description: "No entry ID provided.", variant: "destructive" })
      router.push('/new-entry')
      return
    }
    setTempEntryId(entryId)

    const loadImages = async () => {
      setIsLoading(true)
      try {
        const entry = await journalService.getEntryById(entryId)
        if (entry && entry.images) {
          setProcessedImages(entry.images)
          if (entry.images.length > 0) {
            setCurrentImage(entry.images[0])
            setCurrentPage(1)
          } else {
            toast({ title: "No Images", description: "No images found for this entry.", variant: "destructive" })
            router.push("/new-entry")
          }
        } else {
          toast({ title: "Error", description: "Could not load entry data.", variant: "destructive" })
          router.push('/new-entry')
        }
      } catch (error) {
        console.error("Error loading entry:", error)
        toast({ title: "Error", description: "Failed to load images.", variant: "destructive" })
        router.push('/new-entry')
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()

  }, [searchParams, router, toast])

  const goBack = () => {
    router.push("/new-entry")
  }

  const proceedToExtract = async () => {
    if (processedImages.length === 0 || !tempEntryId) {
      toast({
        title: "No images to process",
        description: "Please go back and capture at least one image first.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      router.push(`/extract?entryId=${tempEntryId}`)
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

  const handleDeleteImage = async () => {
    if (!tempEntryId || !currentImage) return

    const currentImageIndex = currentPage - 1
    if (currentImageIndex < 0 || currentImageIndex >= processedImages.length) return

    try {
      const newImages = processedImages.filter((_, index) => index !== currentImageIndex)
      
      await journalService.updateEntry(tempEntryId, { images: newImages })

      setProcessedImages(newImages)
      
      if (newImages.length === 0) {
        setCurrentImage(null)
        toast({ title: "Last Image Deleted", description: "Redirecting back to add new images." })
        router.push("/new-entry")
      } else {
        const newPageIndex = Math.min(currentImageIndex, newImages.length - 1)
        setCurrentPage(newPageIndex + 1)
        setCurrentImage(newImages[newPageIndex])
      }
       toast({ title: "Image Deleted", description: "Image removed successfully." })
    } catch(error) {
        console.error("Error deleting image:", error)
        toast({ title: "Error", description: "Failed to delete image.", variant: "destructive" })
    }
  }

  const handleRotateImage = () => {
    toast({
      title: "Rotate Image",
      description: "Image rotation functionality would be implemented here.",
    })
  }

  const handleZoomImage = () => {
    toast({
      title: "Zoom Image",
      description: "Image zoom functionality would be implemented here.",
    })
  }
  
  const nextImage = () => {
    if (currentPage < processedImages.length) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      setCurrentImage(processedImages[nextPage - 1])
    }
  }

  const prevImage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      setCurrentImage(processedImages[prevPage - 1])
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-md aspect-[3/4] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <img
                src={currentImage || placeholderImage}
                alt={`Preview of page ${currentPage}`}
                className="w-full h-full object-contain"
              />

              {processedImages.length > 1 && (
                <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                  {currentPage} / {processedImages.length}
                </div>
              )}
            </div>

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
              <Button variant="outline" size="icon" onClick={handleDeleteImage} disabled={!currentImage || isLoading}>
                <Trash2 className="h-5 w-5 text-red-500" />
                <span className="sr-only">Delete</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleRotateImage} disabled={!currentImage || isLoading}>
                <RotateCw className="h-5 w-5" />
                <span className="sr-only">Rotate</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomImage} disabled={!currentImage || isLoading}>
                <ZoomIn className="h-5 w-5" />
                <span className="sr-only">Zoom</span>
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
