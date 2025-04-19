"use client"

import { useState, useEffect, useRef } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  FileText,
  RefreshCw,
  Edit,
  Loader2,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { batchOcrService } from "@/lib/batch-ocr-service"
import { journalService } from "@/lib/journal-service"

interface MultiImageExtractorProps {
  entryId: string;
  onComplete: (combinedText: string, results: any[]) => void;
  onStatusChange: (status: string, isLoading: boolean, failed: boolean) => void;
}

export function MultiImageExtractor({ entryId, onComplete, onStatusChange }: MultiImageExtractorProps) {
  const { toast } = useToast()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  
  // State for images and extraction results
  const [allImages, setAllImages] = useState<string[]>([])
  const [extractionResults, setExtractionResults] = useState<any[]>([])
  const [combinedText, setCombinedText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [viewMode, setViewMode] = useState<'individual'|'combined'>('individual')
  const [errorRanges, setErrorRanges] = useState<{ start: number; end: number }[]>([])
  
  // UI states
  const [isLoading, setIsLoading] = useState(true)
  const [ocrFailed, setOcrFailed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  
  // Load images and process with OCR
  useEffect(() => {
    const processAllImages = async () => {
      if (!entryId) {
        setOcrFailed(true);
        onStatusChange("No Entry ID provided for processing", false, true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      onStatusChange("Loading images...", true, false);

      let imageDataUrls: string[] = [];
      try {
        const entry = await journalService.getEntryById(entryId);
        if (!entry || !entry.images || entry.images.length === 0) {
          throw new Error("Entry not found or contains no images.");
        }
        imageDataUrls = entry.images;
        setAllImages(imageDataUrls);
      } catch (error) {
         console.error('Error loading entry images:', error);
         setOcrFailed(true);
         onStatusChange(`Error loading images: ${(error as Error).message}`, false, true);
         setIsLoading(false);
         return;
      }

      // Check again after loading from DB
      if (imageDataUrls.length === 0) {
        setOcrFailed(true)
        onStatusChange("No images found in the entry to process", false, true)
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      onStatusChange(`Processing ${imageDataUrls.length} images...`, true, false)

      try {
        // Use the batch OCR service
        const batchResults = await batchOcrService.processImages(imageDataUrls)
        
        // Store the results
        setExtractionResults(batchResults.results)
        setCombinedText(batchResults.combinedText)
        
        // Set first result as current
        if (batchResults.results.length > 0) {
          const firstResult = batchResults.results[0]
          setCurrentImage(firstResult.imageUrl)
          
          if (firstResult.success) {
            setExtractedText(firstResult.extractedText)
            
            // Set error ranges if available
            setErrorRanges(firstResult.errorRanges || [])
            
            onStatusChange("Text extracted successfully", false, false)
          } else {
            setOcrFailed(true)
            onStatusChange(`OCR failed: ${firstResult.error || 'Unknown error'}`, false, true)
          }
        } else {
          setOcrFailed(true)
          onStatusChange("No results returned from OCR", false, true)
        }
        
        // Pass results back to parent component
        onComplete(batchResults.combinedText, batchResults.results)
      } catch (error) {
        console.error('Error processing images:', error)
        setOcrFailed(true)
        onStatusChange(`OCR failed: ${(error as Error).message || "Processing error"}`, false, true)
      } finally {
        setIsLoading(false)
      }
    }

    processAllImages()
  }, [entryId, onComplete, onStatusChange])

  // Functions to navigate between extracted texts
  const goToNextPage = () => {
    if (currentPage < extractionResults.length) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      
      const result = extractionResults[nextPage - 1]
      setCurrentImage(result.imageUrl)
      
      if (result.success) {
        setExtractedText(result.extractedText)
        setErrorRanges(result.errorRanges || [])
      } else {
        setExtractedText("")
        setErrorRanges([])
      }
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      
      const result = extractionResults[prevPage - 1]
      setCurrentImage(result.imageUrl)
      
      if (result.success) {
        setExtractedText(result.extractedText)
        setErrorRanges(result.errorRanges || [])
      } else {
        setExtractedText("")
        setErrorRanges([])
      }
    }
  }
  
  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // If in individual mode, update just the current page text
    if (viewMode === 'individual') {
      setExtractedText(e.target.value)
      
      // Update the extraction results
      if (extractionResults.length > 0 && currentPage <= extractionResults.length) {
        const updatedResults = [...extractionResults]
        updatedResults[currentPage - 1].extractedText = e.target.value
        setExtractionResults(updatedResults)
        
        // Also update combined text
        const newCombinedText = updatedResults
          .filter(r => r.success)
          .map((r, i) => `[Page ${i+1}]\n${r.extractedText}`)
          .join('\n\n')
        
        setCombinedText(newCombinedText)
        
        // Notify parent component of changes
        onComplete(newCombinedText, updatedResults)
      }
    } else {
      // Combined mode - update the combined text directly
      setCombinedText(e.target.value)
      
      // Notify parent component of changes
      onComplete(e.target.value, extractionResults)
    }
  }
  
  // Zoom controls for image
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)) // Max zoom 3x
  }
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)) // Min zoom 0.5x
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Processing images...</p>
        </div>
      </div>
    )
  }

  if (allImages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No images available for processing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* View mode selector */}
      <div className="mb-4">
        <Tabs 
          value={viewMode} 
          onValueChange={(value) => setViewMode(value as 'individual'|'combined')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Individual Pages
            </TabsTrigger>
            <TabsTrigger value="combined" className="flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Combined Text
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="mt-4">
            {/* Page navigation */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">
                Page {currentPage} of {allImages.length}
              </span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPrevPage} 
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextPage} 
                  disabled={currentPage >= allImages.length}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            
            {/* Side-by-side comparison layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Original Image Column */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium">Original Image</h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={zoomOut} disabled={zoomLevel <= 0.5}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium">{Math.round(zoomLevel * 100)}%</span>
                    <Button variant="outline" size="sm" onClick={zoomIn} disabled={zoomLevel >= 3}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Card className="flex-1 overflow-auto relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                  {currentImage ? (
                    <div className="h-full overflow-auto p-4 flex items-center justify-center">
                      <div 
                        className="relative" 
                        style={{ 
                          transform: `scale(${zoomLevel})`, 
                          transformOrigin: 'center center',
                          transition: 'transform 0.2s ease-out'
                        }}
                      >
                        <img 
                          src={currentImage} 
                          alt={`Original journal page ${currentPage}`} 
                          className="max-w-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-4 text-gray-400">
                      No image available
                    </div>
                  )}
                </Card>
              </div>
              
              {/* Extracted Text Column */}
              <div className="flex flex-col">
                <div className="mb-2">
                  <Label htmlFor="extracted-text" className="text-sm font-medium">
                    Extracted Text{" "}
                    {extractionResults[currentPage - 1]?.success === false && (
                      <span className="text-red-600 dark:text-red-400">(OCR failed for this image)</span>
                    )}
                  </Label>
                </div>

                <Textarea
                  ref={textAreaRef}
                  id="extracted-text"
                  value={extractedText}
                  onChange={handleTextChange}
                  placeholder={extractionResults[currentPage - 1]?.success === false ? 
                    "OCR failed for this image. You can enter text manually." : 
                    "Extracted text will appear here..."
                  }
                  className="flex-1 min-h-[300px] text-base resize-none font-mono"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="combined" className="mt-4">
            <div className="mb-2">
              <Label htmlFor="combined-text" className="text-sm font-medium">
                Combined Text from All Images
              </Label>
            </div>
            
            <Textarea
              id="combined-text"
              value={combinedText}
              onChange={handleTextChange}
              placeholder="Combined text from all images will appear here..."
              className="w-full min-h-[400px] text-base resize-none font-mono"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 