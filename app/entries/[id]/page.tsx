"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Download, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { journalService, JournalEntry } from "@/lib/journal-service"
import { useAuth } from "@/lib/auth-context"

export default function EntryDetailsScreen({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [entry, setEntry] = useState<JournalEntry | null>(null)

  // Unwrap params using React.use()
  const resolvedParams = params instanceof Promise ? use(params) : params
  const entryId = resolvedParams.id

  // Fetch entry data when component mounts
  useEffect(() => {
    const fetchEntry = async () => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your entries.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        setIsLoading(true)
        const fetchedEntry = await journalService.getEntryById(entryId)
        
        if (!fetchedEntry) {
          toast({
            title: "Entry not found",
            description: "The journal entry you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/entries")
          return
        }

        // Check if entry belongs to current user
        if (fetchedEntry.userId !== user.uid) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this entry.",
            variant: "destructive",
          })
          router.push("/entries")
          return
        }

        setEntry(fetchedEntry)
      } catch (error) {
        console.error('Error fetching entry:', error)
        toast({
          title: "Error loading entry",
          description: "There was a problem loading the journal entry.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [entryId, user, router, toast])

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Unknown Date'
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const goBack = () => {
    router.push("/entries")
  }

  const handleEdit = () => {
    router.push(`/entries/${entryId}/edit`)
  }

  const handleDelete = async () => {
    if (!entry || !entry.id) return

    try {
      setIsDeleting(true)
      await journalService.deleteEntry(entry.id)
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted successfully.",
      })
      router.push("/entries")
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast({
        title: "Error deleting entry",
        description: "There was a problem deleting your journal entry.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Button>
              <h1 className="ml-4 text-xl font-semibold">Entry Details</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container p-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading entry...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Button>
              <h1 className="ml-4 text-xl font-semibold">Entry Details</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Entry not found</p>
            <Button className="mt-4" onClick={goBack}>
              Back to Entries
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Extract qualifiers by type
  const getToneQualifier = () => entry.qualifiers.find(q => q.startsWith('Tone:'))?.split(': ')[1] || ''
  const getTopicQualifier = () => entry.qualifiers.find(q => q.startsWith('Topic:'))?.split(': ')[1] || ''
  const getMoodQualifier = () => entry.qualifiers.find(q => q.startsWith('Mood:'))?.split(': ')[1] || ''
  const getContextQualifier = () => entry.qualifiers.find(q => q.startsWith('Context:'))?.split(': ')[1] || ''
  
  const allQualifiers = [
    getToneQualifier(),
    getTopicQualifier(),
    getMoodQualifier(),
    getContextQualifier()
  ].filter(Boolean)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
            <h1 className="ml-4 text-xl font-semibold">Entry Details</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-red-500" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
              <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container p-4 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{entry.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{formatDate(entry.createdAt)}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {allQualifiers.map((qualifier, i) => (
                <Badge key={i} variant="secondary">
                  {qualifier}
                </Badge>
              ))}
            </div>
          </div>

          {entry.images && entry.images.length > 0 && (
            <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Journal Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entry.images.map((image, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Journal page ${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                    Page {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Extracted Text</h3>
            <Card>
              <CardContent className="p-4">
                <div className="whitespace-pre-wrap font-mono text-sm">{entry.text}</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tone</dt>
                  <dd>{getToneQualifier() || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Topic</dt>
                  <dd>{getTopicQualifier() || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mood</dt>
                  <dd>{getMoodQualifier() || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Context</dt>
                  <dd>{getContextQualifier() || 'Not specified'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
