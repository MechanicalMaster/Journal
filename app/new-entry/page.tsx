"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Zap, ZapOff, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CameraScreen() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [pageCount, setPageCount] = useState(1)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [showAddAnother, setShowAddAnother] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null

    async function setupCamera() {
      try {
        // Request camera access with flash if supported
        const constraints = {
          video: {
            facingMode: "environment", // Use back camera if available
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ torch: isFlashOn }], // May not be supported on all devices
          },
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasCamera(true)
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
         const errorMessage = err instanceof Error ? err.message : "Could not access camera. Please check permissions.";
        setCameraError(errorMessage)

        setHasCamera(false)
      }
    }

    setupCamera()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isFlashOn]) // Re-initialize when flash setting changes

  // Toggle flash (may not work on all devices/browsers)
  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn)
  }

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg")

        // Add to captured images array
        setCapturedImages([...capturedImages, imageDataUrl])

        // Show "Add Another Page" option
        setShowAddAnother(true)
      }
    }
  }

  // Add another page
  const addAnotherPage = () => {
    setPageCount(pageCount + 1)
    setShowAddAnother(false)
  }

  // Continue to preview screen
  const continueToPreview = () => {
    // In a real app, you would pass the captured images to the next screen
    // For now, we'll just navigate and log the number of images
    console.log(`Captured ${capturedImages.length} images`)
    router.push("/preview")
  }

  // Cancel and return to home
  const cancelCapture = () => {
    router.push("/")
  }

  return (
    <div className="relative flex flex-col h-screen bg-black">
      {/* Camera View */}
      {hasCamera ? (
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-0">
          {cameraError || "Camera not available"}
        </div>
      )}

      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Focus Frame */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-4/5 h-3/5 border-2 border-white rounded-md opacity-70"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={cancelCapture}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Cancel</span>
        </Button>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={toggleFlash}
          >
            {isFlashOn ? <Zap className="h-6 w-6 text-yellow-400" /> : <ZapOff className="h-6 w-6" />}
            <span className="sr-only">Toggle Flash</span>
          </Button>
        </div>
      </div>

      {/* Page Indicator */}
      <div className="absolute top-16 left-0 right-0 flex justify-center z-20">
        <div className="px-3 py-1 bg-black/50 rounded-full text-white text-sm">Page {pageCount}</div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-6 z-20">
        {showAddAnother ? (
          <div className="flex space-x-4 mb-6">
            <Button variant="outline" className="bg-white text-black hover:bg-gray-200" onClick={addAnotherPage}>
              Add Another Page
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={continueToPreview}>
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
            onClick={captureImage}
            disabled={!hasCamera}
          >
            <Camera className="h-8 w-8 text-black" />
            <span className="sr-only">Capture</span>
          </Button>
        )}
      </div>
    </div>
  )
}
