"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Edit, 
  Loader2, 
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { imageService } from "@/lib/image-service"
import { useAuth } from "@/lib/auth-context"
import { journalService } from "@/lib/journal-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MultiImageExtractor } from "@/components/multi-image-extractor"

export default function TextExtractionScreen() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TextExtractionContent />
    </Suspense>
  )
}

// Fallback component to show during loading
function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// Renamed the original component function to avoid conflict
function TextExtractionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [extractedText, setExtractedText] = useState("")
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [ocrFailed, setOcrFailed] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Extracting text...")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  
  // Multi-image support
  const [extractionResults, setExtractionResults] = useState<any[]>([])
  
  // Compression stats
  // const [compressionStats, setCompressionStats] = useState<{
  //   originalSize: number;
  //   compressedSize: number;
  //   compressionRatio: number;
  //   level: string;
  // } | null>(null)
  
  // Qualifiers state
  const [showQualifiers, setShowQualifiers] = useState(false)
  const [tone, setTone] = useState("")
  const [topic, setTopic] = useState("")
  const [mood, setMood] = useState("")
  const [context, setContext] = useState("")
  const [tempEntryId, setTempEntryId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Get entryId from query params
  useEffect(() => {
    const entryId = searchParams.get('entryId')
    if (!entryId) {
      toast({ title: "Error", description: "No entry ID provided.", variant: "destructive" })
      router.push('/new-entry')
      return
    }
    setTempEntryId(entryId)
  }, [searchParams, router, toast])

  const handleShowQualifiers = () => {
    setShowQualifiers(true)
  }
  
  // Memoize callback functions to prevent unnecessary re-renders
  const handleExtractionComplete = useCallback((combinedText: string, results: any[]) => {
    setExtractedText(combinedText)
    setExtractionResults(results)
    
    // Optionally pre-fill title based on first few words
    const initialTitle = combinedText.trim().split(/\s+/).slice(0, 5).join(' ')
    const initialTitleWithEllipsis = combinedText.trim().split(/\s+/).length > 5 ? initialTitle + '...' : initialTitle
    setTitle(initialTitleWithEllipsis || 'Untitled Entry')
  }, []) // Empty dependency array
  
  const handleStatusChange = useCallback((status: string, loading: boolean, failed: boolean) => {
    setStatusMessage(status)
    setIsLoading(loading)
    setOcrFailed(failed)
  }, []) // Empty dependency array

  const handleSaveText = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your entry.",
        variant: "destructive",
      })
      return
    }

    if (!tempEntryId) {
      toast({ title: "Error", description: "Entry ID is missing.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      // Use the title from state, provide default if empty
      const finalTitle = title.trim() || 'Untitled Entry'

      // Create qualifiers array
      const qualifiers = []
      if (tone) qualifiers.push(`Tone: ${tone}`)
      if (topic) qualifiers.push(`Topic: ${topic}`)
      if (mood) qualifiers.push(`Mood: ${mood}`)
      if (context) qualifiers.push(`Context: ${context}`)

      // Save the entry using the journal service
      await journalService.updateEntry(tempEntryId!, {
        title: finalTitle,
        text: extractedText,
        qualifiers: qualifiers
      })

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
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => {
    if (tempEntryId) {
      router.push(`/preview?entryId=${tempEntryId}`)
    } else {
      router.push("/new-entry")
    }
  }

  // Add a new function for fresh manual entry
  const handleManualEntry = () => {
    setExtractedText("")
    setOcrFailed(false)
    setStatusMessage("Manual entry mode")

    // Focus on the text area
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
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
        {ocrFailed ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">OCR Failed</h2>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't clearly extract text from your images. You can retry or enter text manually.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry OCR
              </Button>
              <Button onClick={handleManualEntry}>
                <Edit className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Image extractor component */}
            {tempEntryId && (
            <MultiImageExtractor 
                entryId={tempEntryId}
              onComplete={handleExtractionComplete} 
              onStatusChange={handleStatusChange} 
            />
            )}
            
            {/* Compression Stats */}
            {/* {compressionStats && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-lg font-semibold mb-4">Compression Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="original-size">Original Size</Label>
                    <div className="text-lg">{compressionStats.originalSize} KB</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compressed-size">Compressed Size</Label>
                    <div className="text-lg">{compressionStats.compressedSize} KB</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compression-ratio">Compression Ratio</Label>
                    <div className="text-lg">{Math.round(compressionStats.compressionRatio * 100)}%</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compression-level">Compression Level</Label>
                    <div className="text-lg font-medium">{compressionStats.level}</div>
                  </div>
                </div>
              </div>
            )} */}
            
            {/* Title Input Section */}
            {!isLoading && !ocrFailed && (
              <div className="mb-6">
                <Label htmlFor="entry-title" className="text-lg font-semibold mb-2 block">Title</Label>
                <Input 
                  id="entry-title"
                  placeholder="Enter a title for your entry"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>
            )}
            
            {/* Qualifiers Section */}
            {showQualifiers && !isLoading && !ocrFailed && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-lg font-semibold mb-4">Qualifiers</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reflective">Reflective</SelectItem>
                        <SelectItem value="Analytical">Analytical</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                        <SelectItem value="Informal">Informal</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="Humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger id="topic">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Creativity">Creativity</SelectItem>
                        <SelectItem value="Product Philosophy">Product Philosophy</SelectItem>
                        <SelectItem value="Philosophy">Philosophy</SelectItem>
                        <SelectItem value="Marriage">Marriage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger id="mood">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Calm">Calm</SelectItem>
                        <SelectItem value="Energetic">Energetic</SelectItem>
                        <SelectItem value="Happy">Happy</SelectItem>
                        <SelectItem value="Sad">Sad</SelectItem>
                        <SelectItem value="Anxious">Anxious</SelectItem>
                        <SelectItem value="Relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="context">Context</Label>
                    <Input 
                      id="context" 
                      placeholder="Enter a context (e.g., Morning coffee break notes)"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
              {!ocrFailed && !isLoading && (
                <>
                  <Button variant="outline" onClick={handleManualEntry}>
                    <Edit className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                  {!showQualifiers ? (
                    <Button onClick={handleShowQualifiers} disabled={!extractedText.trim()}>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Add Qualifiers
                    </Button>
                  ) : (
                    <Button onClick={handleSaveText} disabled={!extractedText.trim()}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                      Save Entry
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-end px-4">
          <Button 
            onClick={handleSaveText} 
            disabled={isLoading || isSaving || ocrFailed || !extractedText.trim()}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Entry
          </Button>
        </div>
      </footer>
    </div>
  )
}
