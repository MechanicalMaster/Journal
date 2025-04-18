"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { journalService, JournalEntry } from "@/lib/journal-service"
import { useAuth } from "@/lib/auth-context"

// Tone, topic, and mood options for dropdowns
const toneOptions = ["Reflective", "Analytical", "Formal", "Informal", "Critical", "Humorous"]
const topicOptions = ["Work", "Personal", "Health", "Finance", "Education", "Creativity"]
const moodOptions = ["Calm", "Energetic", "Happy", "Sad", "Anxious", "Relaxed"]

// Constants for "None" value
const NONE_VALUE = "none"

export default function EditEntryScreen({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Unwrap params using React.use()
  const resolvedParams = params instanceof Promise ? use(params) : params
  const entryId = resolvedParams.id

  // State for entry and loading
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [originalEntry, setOriginalEntry] = useState<JournalEntry | null>(null)
  
  // State for form values
  const [entryText, setEntryText] = useState("")
  const [tone, setTone] = useState(NONE_VALUE)
  const [topic, setTopic] = useState(NONE_VALUE)
  const [mood, setMood] = useState(NONE_VALUE)
  const [context, setContext] = useState("")

  // State for tracking changes and UI
  const [isSaving, setIsSaving] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showQualifierReminder, setShowQualifierReminder] = useState(false)
  const [changedFields, setChangedFields] = useState<Record<string, boolean>>({})

  // Extract qualifiers from the entry
  const extractQualifiers = (entry: JournalEntry) => {
    const toneQualifier = entry.qualifiers.find(q => q.startsWith('Tone:'))?.split(': ')[1] || NONE_VALUE;
    const topicQualifier = entry.qualifiers.find(q => q.startsWith('Topic:'))?.split(': ')[1] || NONE_VALUE;
    const moodQualifier = entry.qualifiers.find(q => q.startsWith('Mood:'))?.split(': ')[1] || NONE_VALUE;
    const contextQualifier = entry.qualifiers.find(q => q.startsWith('Context:'))?.split(': ')[1] || "";
    
    return { toneQualifier, topicQualifier, moodQualifier, contextQualifier };
  }

  // Fetch entry data when component mounts
  useEffect(() => {
    const fetchEntry = async () => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to edit your entries.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        setIsPageLoading(true)
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
            description: "You don't have permission to edit this entry.",
            variant: "destructive",
          })
          router.push("/entries")
          return
        }

        // Set the original entry
        setOriginalEntry(fetchedEntry)
        
        // Extract qualifiers and set form values
        const { toneQualifier, topicQualifier, moodQualifier, contextQualifier } = extractQualifiers(fetchedEntry);
        setEntryText(fetchedEntry.text)
        setTone(toneQualifier)
        setTopic(topicQualifier)
        setMood(moodQualifier)
        setContext(contextQualifier)
      } catch (error) {
        console.error('Error fetching entry:', error)
        toast({
          title: "Error loading entry",
          description: "There was a problem loading the journal entry.",
          variant: "destructive",
        })
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchEntry()
  }, [entryId, user, router, toast])

  // Check if any changes have been made
  const hasChanges = () => {
    if (!originalEntry) return false
    
    const { toneQualifier, topicQualifier, moodQualifier, contextQualifier } = extractQualifiers(originalEntry);
    
    return (
      entryText !== originalEntry.text ||
      tone !== toneQualifier ||
      topic !== topicQualifier ||
      mood !== moodQualifier ||
      context !== contextQualifier
    )
  }

  // Check if at least one qualifier is selected
  const hasQualifiers = () => {
    return tone !== NONE_VALUE || topic !== NONE_VALUE || mood !== NONE_VALUE
  }

  // Update changed fields for visual indication
  useEffect(() => {
    if (!originalEntry) return
    
    const { toneQualifier, topicQualifier, moodQualifier, contextQualifier } = extractQualifiers(originalEntry);
    const newChangedFields: Record<string, boolean> = {}

    if (entryText !== originalEntry.text) newChangedFields.text = true
    if (tone !== toneQualifier) newChangedFields.tone = true
    if (topic !== topicQualifier) newChangedFields.topic = true
    if (mood !== moodQualifier) newChangedFields.mood = true
    if (context !== contextQualifier) newChangedFields.context = true

    setChangedFields(newChangedFields)
  }, [entryText, tone, topic, mood, context, originalEntry])

  const handleSave = async () => {
    if (!originalEntry) return
    
    // Check if at least one qualifier is selected
    if (!hasQualifiers()) {
      setShowQualifierReminder(true)
      return
    }

    setIsSaving(true)
    
    try {
      // Create updated qualifiers array
      const updatedQualifiers = []
      if (tone !== NONE_VALUE) updatedQualifiers.push(`Tone: ${tone}`)
      if (topic !== NONE_VALUE) updatedQualifiers.push(`Topic: ${topic}`)
      if (mood !== NONE_VALUE) updatedQualifiers.push(`Mood: ${mood}`)
      if (context) updatedQualifiers.push(`Context: ${context}`)
      
      // Create a title from the first few words of the text
      const title = entryText.split(' ').slice(0, 5).join(' ') + '...'
      
      // Save changes
      await journalService.updateEntry(entryId, {
        title,
        text: entryText,
        qualifiers: updatedQualifiers,
      })
      
      toast({
        title: "Changes saved",
        description: "Your entry has been updated successfully.",
      })
      
      router.push(`/entries/${entryId}`)
    } catch (error) {
      console.error('Error updating entry:', error)
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges()) {
      setShowDiscardDialog(true)
    } else {
      router.push(`/entries/${entryId}`)
    }
  }

  const handleDiscard = () => {
    setShowDiscardDialog(false)
    router.push(`/entries/${entryId}`)
  }

  const handleContinueEditing = () => {
    setShowQualifierReminder(false)
  }

  const handleForceSave = async () => {
    setShowQualifierReminder(false)
    
    if (!originalEntry) return
    
    setIsSaving(true)
    
    try {
      // Create updated qualifiers array - without requiring any qualifiers
      const updatedQualifiers = []
      if (tone !== NONE_VALUE) updatedQualifiers.push(`Tone: ${tone}`)
      if (topic !== NONE_VALUE) updatedQualifiers.push(`Topic: ${topic}`)
      if (mood !== NONE_VALUE) updatedQualifiers.push(`Mood: ${mood}`)
      if (context) updatedQualifiers.push(`Context: ${context}`)
      
      // Create a title from the first few words of the text
      const title = entryText.split(' ').slice(0, 5).join(' ') + '...'
      
      // Save changes
      await journalService.updateEntry(entryId, {
        title,
        text: entryText,
        qualifiers: updatedQualifiers,
      })
      
      toast({
        title: "Changes saved",
        description: "Your entry has been updated successfully.",
      })
      
      router.push(`/entries/${entryId}`)
    } catch (error) {
      console.error('Error updating entry:', error)
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Loading state
  if (isPageLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => router.push('/entries')}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Button>
              <h1 className="ml-4 text-xl font-semibold">Edit Entry</h1>
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
            <h1 className="ml-4 text-xl font-semibold">Edit Entry</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges() || isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container p-4 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="entry-text" className="text-base font-medium">
                Entry Text
              </Label>
              {changedFields.text && (
                <span className="text-amber-500 dark:text-amber-400 text-sm font-medium">*Modified</span>
              )}
            </div>
            <Textarea
              id="entry-text"
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              className="min-h-[300px] font-mono text-base"
              placeholder="Enter your journal text here..."
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-medium">Qualifiers</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tone" className="text-sm">
                    Tone
                  </Label>
                  {changedFields.tone && (
                    <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">*Modified</span>
                  )}
                </div>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {toneOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topic" className="text-sm">
                    Topic
                  </Label>
                  {changedFields.topic && (
                    <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">*Modified</span>
                  )}
                </div>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {topicOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mood" className="text-sm">
                    Mood
                  </Label>
                  {changedFields.mood && (
                    <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">*Modified</span>
                  )}
                </div>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="Select a mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {moodOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="context" className="text-sm">
                    Context
                  </Label>
                  {changedFields.context && (
                    <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">*Modified</span>
                  )}
                </div>
                <Input
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Add context (optional)"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard} className="bg-red-500 hover:bg-red-600">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Qualifier Reminder Dialog */}
      <Dialog open={showQualifierReminder} onOpenChange={setShowQualifierReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              Add at least one qualifier?
            </DialogTitle>
            <DialogDescription>
              Qualifiers help organize and find your entries later. It's recommended to add at least one qualifier.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleContinueEditing}>
              Continue Editing
            </Button>
            <Button onClick={handleForceSave}>Save Without Qualifiers</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
