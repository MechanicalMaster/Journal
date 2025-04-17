"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, RefreshCw, Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { imageService } from "@/lib/image-service"
import { useAuth } from "@/lib/auth-context"
import { journalService } from "@/lib/journal-service"

export default function TextExtractionScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [extractedText, setExtractedText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [ocrFailed, setOcrFailed] = useState(false)
  const [errorRanges, setErrorRanges] = useState<{ start: number; end: number }[]>([])
  const [statusMessage, setStatusMessage] = useState("Extracting text...")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [highlightedText, setHighlightedText] = useState<React.ReactNode>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  // Process the image using OpenAI API
  useEffect(() => {
    const extractTextFromImage = async () => {
      // Get the current image from localStorage
      const storedImage = localStorage.getItem('currentImage')
      if (!storedImage) {
        setOcrFailed(true)
        setStatusMessage("No image found to process")
        setIsLoading(false)
        return
      }

      setCurrentImage(storedImage)
      setIsLoading(true)
      setStatusMessage("Extracting text...")

      try {
        // Call the API to process the image
        const result = await imageService.processImage(storedImage)

        if (result.success && result.text) {
          setExtractedText(result.text)
          if (result.errorRanges && result.errorRanges.length > 0) {
            setErrorRanges(result.errorRanges)
          }
          setStatusMessage("Text extracted successfully")
        } else {
          setOcrFailed(true)
          setStatusMessage(`OCR failed: ${result.error || 'Text unclear'}`)
        }
      } catch (error) {
        console.error('Error extracting text:', error)
        setOcrFailed(true)
        setStatusMessage(`OCR failed: ${(error as Error).message || "Processing error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    extractTextFromImage()
  }, [])

  // Process text with highlighted errors
  useEffect(() => {
    if (!extractedText || errorRanges.length === 0) {
      setHighlightedText(extractedText)
      return
    }

    // Create highlighted text by splitting at error ranges and wrapping in spans
    let lastIndex = 0
    const textParts: React.ReactNode[] = []

    errorRanges.forEach((range, i) => {
      // Add text before error
      if (range.start > lastIndex) {
        textParts.push(extractedText.substring(lastIndex, range.start))
      }

      // Add highlighted error text
      textParts.push(
        <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50">
          {extractedText.substring(range.start, range.end)}
        </span>,
      )

      lastIndex = range.end
    })

    // Add remaining text
    if (lastIndex < extractedText.length) {
      textParts.push(extractedText.substring(lastIndex))
    }

    setHighlightedText(textParts)
  }, [extractedText, errorRanges])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractedText(e.target.value)
    // Clear error highlights when user edits text
    setErrorRanges([])
  }

  const handleRetryOcr = async () => {
    // Reset and retry OCR
    setOcrFailed(false)
    setExtractedText("")
    setErrorRanges([])

    if (!currentImage) {
      toast({
        title: "No image to process",
        description: "Please go back and capture an image first.",
        variant: "destructive",
      })
      return
    }

    // Process the image again
    setIsLoading(true)
    setStatusMessage("Extracting text...")

    try {
      // Call the API to process the image
      const result = await imageService.processImage(currentImage)

      if (result.success && result.text) {
        setExtractedText(result.text)
        if (result.errorRanges && result.errorRanges.length > 0) {
          setErrorRanges(result.errorRanges)
        }
        setStatusMessage("Text extracted successfully")
      } else {
        setOcrFailed(true)
        setStatusMessage(`OCR failed: ${result.error || 'Text unclear'}`)
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      setOcrFailed(true)
      setStatusMessage(`OCR failed: ${(error as Error).message || "Processing error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualEntry = () => {
    setExtractedText("")
    setErrorRanges([])
    setOcrFailed(false)
    setStatusMessage("Manual entry mode")

    // Focus on the text area
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }

  const handleSaveText = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your entry.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the captured images from localStorage
      const storedImages = localStorage.getItem('capturedImages')
      const imageDataUrls = storedImages ? JSON.parse(storedImages) : []

      // Create a title from the first few words of the text
      const title = extractedText.split(' ').slice(0, 5).join(' ') + '...'

      // Save the entry using the journal service
      await journalService.processAndSaveEntry(
        user.uid,
        title,
        extractedText,
        imageDataUrls,
        [] // Qualifiers will be added in the next step
      )

      // Clear localStorage
      localStorage.removeItem('currentImage')
      localStorage.removeItem('capturedImages')
      localStorage.removeItem('extractedText')

      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      })

      // Navigate to the entries page
      router.push("/entries")
    } catch (error) {
      console.error('Error saving entry:', error)
      toast({
        title: "Error saving entry",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
      })
    }
  }

  const goBack = () => {
    router.push("/preview")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>

          <div className="flex-1 flex justify-center">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                ocrFailed
                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  : isLoading
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />}
              {statusMessage}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container p-4 flex flex-col">
        <div className="flex-1 flex flex-col space-y-4">
          {ocrFailed ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">OCR Failed</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We couldn't clearly extract text from your image. You can retry or enter text manually.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleRetryOcr}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry OCR
                </Button>
                <Button onClick={handleManualEntry}>
                  <Edit className="h-4 w-4 mr-2" />
                  Enter Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="mb-2">
                <label htmlFor="extracted-text" className="text-sm font-medium">
                  Extracted Text{" "}
                  {errorRanges.length > 0 && (
                    <span className="text-yellow-600 dark:text-yellow-400">(potential errors highlighted)</span>
                  )}
                </label>
              </div>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md border p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <Textarea
                  ref={textAreaRef}
                  id="extracted-text"
                  value={extractedText}
                  onChange={handleTextChange}
                  placeholder="Extracted text will appear here..."
                  className="flex-1 min-h-[300px] text-base resize-none font-mono"
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          {!ocrFailed && !isLoading && (
            <>
              <Button variant="outline" onClick={handleManualEntry}>
                <Edit className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
              <Button variant="outline" onClick={handleRetryOcr}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry OCR
              </Button>
              <Button onClick={handleSaveText} disabled={!extractedText.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Text
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
