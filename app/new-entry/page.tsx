"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Upload, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { journalService } from "@/lib/journal-service"
import { useToast } from "@/components/ui/use-toast"

export default function UploadScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [showAddAnother, setShowAddAnother] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const { toast } = useToast()

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result.toString()
        setCurrentImage(imageDataUrl)
        // Process the image once it's loaded
        processImage(imageDataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  // Process the image once selected
  const processImage = (imageDataUrl: string) => {
    // Add to captured images array
    const newCapturedImages = [...capturedImages, imageDataUrl]
    setCapturedImages(newCapturedImages)
    
    // Show "Add Another Page" option
    setShowAddAnother(true)
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Add another page
  const addAnotherPage = () => {
    setPageCount(pageCount + 1)
    setShowAddAnother(false)
    setCurrentImage(null)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Continue to preview screen
  const continueToPreview = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" })
      return
    }
    if (capturedImages.length === 0) {
      toast({ title: "No Images", description: "Please add at least one image.", variant: "destructive" })
      return
    }

    setIsNavigating(true)
    try {
      // Create a temporary entry with only userId and images
      const tempEntry = await journalService.createEntry({
        userId: user.uid,
        title: 'Untitled Entry (Temporary)', // Placeholder title
        text: '', // Empty text
        images: capturedImages,
        qualifiers: [], // Empty qualifiers
      })

      if (tempEntry && tempEntry.id) {
        // Navigate to preview, passing the temporary entry ID
        router.push(`/preview?entryId=${tempEntry.id}`)
      } else {
        throw new Error("Failed to create temporary entry or get its ID.")
      }

    } catch (error) {
      console.error("Error creating temporary entry:", error)
      toast({ title: "Error", description: "Could not proceed to preview. Please try again.", variant: "destructive" })
      setIsNavigating(false)
    }
    // No need to set isNavigating to false on success, as we are navigating away
  }

  // Cancel and return to home
  const cancelUpload = () => {
    router.push("/")
  }

  return (
    <div className="relative flex flex-col h-screen bg-gray-900">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Image Preview */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        {currentImage ? (
          <div className="w-4/5 h-3/5 relative">
            <img 
              src={currentImage} 
              alt="Uploaded page" 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-4/5 h-3/5 border-2 border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center text-white text-center p-6">
            <Upload className="h-12 w-12 mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
            <p className="text-gray-400">Click the button below to upload a page</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for processing if needed */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={cancelUpload}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>

      {/* Page Indicator */}
      <div className="absolute top-16 left-0 right-0 flex justify-center z-20">
        <div className="px-3 py-1 bg-black/50 rounded-full text-white text-sm">Page {pageCount}</div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-6 z-20">
        {showAddAnother ? (
          <div className="flex space-x-4 mb-6">
            <Button variant="outline" className="bg-white text-black hover:bg-gray-200" onClick={addAnotherPage} disabled={isNavigating}>
              Add Another Page
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={continueToPreview} disabled={isNavigating}>
              {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-white hover:bg-gray-200 border-4 border-gray-300",
            )}
            onClick={triggerFileUpload}
          >
            <Upload className="h-8 w-8 text-black" />
            <span className="sr-only">Upload</span>
          </Button>
        )}
      </div>
    </div>
  )
}
