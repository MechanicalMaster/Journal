"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, RefreshCw, Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Mock OCR result with some "errors" to demonstrate highlighting
const mockOcrResult = {
  text: "Today I woke up feeling [energized] and ready to tackle the day. My first meeting went well, though there were some [concems] about the timeline. I need to follow up with Sarah about the project [deliverables] by Friday.\n\nThings to remember:\n- Buy groceries\n- Schedule dentist appointment\n- Finish reading chapter 5",
  errorRanges: [
    { start: 27, end: 38 }, // [energized]
    { start: 107, end: 116 }, // [concems]
    { start: 162, end: 175 }, // [deliverables]
  ],
}

export default function TextExtractionScreen() {
  const router = useRouter()
  const [extractedText, setExtractedText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [ocrFailed, setOcrFailed] = useState(false)
  const [errorRanges, setErrorRanges] = useState<{ start: number; end: number }[]>([])
  const [statusMessage, setStatusMessage] = useState("Extracting text...")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [highlightedText, setHighlightedText] = useState<React.ReactNode>(null)

  // Simulate OCR process
  useEffect(() => {
    const simulateOcr = async () => {
      setIsLoading(true)
      setStatusMessage("Extracting text...")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Randomly succeed or fail for demonstration
      const success = Math.random() > 0.3 // 70% success rate

      if (success) {
        setExtractedText(mockOcrResult.text)
        setErrorRanges(mockOcrResult.errorRanges)
        setStatusMessage("Text extracted successfully")
      } else {
        setOcrFailed(true)
        setStatusMessage("OCR failed: Text unclear")
      }

      setIsLoading(false)
    }

    simulateOcr()
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

  const handleRetryOcr = () => {
    // Reset and retry OCR
    setOcrFailed(false)
    setExtractedText("")
    setErrorRanges([])

    // Simulate OCR process again
    const simulateOcr = async () => {
      setIsLoading(true)
      setStatusMessage("Extracting text...")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      setExtractedText(mockOcrResult.text)
      setErrorRanges(mockOcrResult.errorRanges)
      setStatusMessage("Text extracted successfully")
      setIsLoading(false)
    }

    simulateOcr()
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

  const handleSaveText = () => {
    // In a real app, you would save the text here
    console.log("Saving text:", extractedText)
    router.push("/qualifiers")
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
