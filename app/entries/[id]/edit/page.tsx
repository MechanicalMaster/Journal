"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react"
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

// Mock data for dropdowns
const toneOptions = ["Playful", "Serious", "Sarcastic", "Reflective", "Upbeat", "Melancholic"]
const topicOptions = ["Work", "Life", "Family", "Health", "Travel", "Learning"]
const moodOptions = ["Happy", "Sad", "Anxious", "Calm", "Excited", "Tired"]

export default function EditEntryScreen({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const entryId = params.id

  // Mock entry data - in a real app, you would fetch this from your API
  const originalEntry = {
    id: entryId,
    text: "Today I woke up feeling energized and ready to tackle the day. My first meeting went well, though there were some concerns about the timeline. I need to follow up with Sarah about the project deliverables by Friday.\n\nThings to remember:\n- Buy groceries\n- Schedule dentist appointment\n- Finish reading chapter 5",
    tone: "Reflective",
    topic: "Work",
    mood: "Calm",
    context: "Morning coffee break notes",
  }

  // State for form values
  const [entryText, setEntryText] = useState(originalEntry.text)
  const [tone, setTone] = useState(originalEntry.tone)
  const [topic, setTopic] = useState(originalEntry.topic)
  const [mood, setMood] = useState(originalEntry.mood)
  const [context, setContext] = useState(originalEntry.context)

  // State for tracking changes and UI
  const [isLoading, setIsLoading] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showQualifierReminder, setShowQualifierReminder] = useState(false)
  const [changedFields, setChangedFields] = useState<Record<string, boolean>>({})

  const originalEntryText = originalEntry.text
  const originalEntryTone = originalEntry.tone
  const originalEntryTopic = originalEntry.topic
  const originalEntryMood = originalEntry.mood
  const originalEntryContext = originalEntry.context

  // Check if any changes have been made
  const hasChanges = () => {
    return (
      entryText !== originalEntryText ||
      tone !== originalEntryTone ||
      topic !== originalEntry.topic ||
      mood !== originalEntry.mood ||
      context !== originalEntry.context
    )
  }

  // Check if at least one qualifier is selected
  const hasQualifiers = () => {
    return tone || topic || mood
  }

  // Update changed fields for visual indication
  useEffect(() => {
    const newChangedFields: Record<string, boolean> = {}

    if (entryText !== originalEntryText) newChangedFields.text = true
    if (tone !== originalEntryTone) newChangedFields.tone = true
    if (topic !== originalEntryTopic) newChangedFields.topic = true
    if (mood !== originalEntryMood) newChangedFields.mood = true
    if (context !== originalEntryContext) newChangedFields.context = true

    setChangedFields(newChangedFields)
  }, [
    entryText,
    tone,
    topic,
    mood,
    context,
    originalEntryText,
    originalEntryTone,
    originalEntryTopic,
    originalEntryMood,
    originalEntryContext,
  ])

  const handleSave = () => {
    // Check if at least one qualifier is selected
    if (!hasQualifiers()) {
      setShowQualifierReminder(true)
      return
    }

    // In a real app, you would save the changes to your API
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Show success toast
      toast({
        title: "Changes saved",
        description: "Your entry has been updated successfully.",
      })

      // Navigate back to entry details
      router.push(`/entries/${entryId}`)
    }, 1000)
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

  const handleForceSave = () => {
    setShowQualifierReminder(false)

    // In a real app, you would save the changes to your API
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Show success toast
      toast({
        title: "Changes saved",
        description: "Your entry has been updated successfully.",
      })

      // Navigate back to entry details
      router.push(`/entries/${entryId}`)
    }, 1000)
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
            <Button onClick={handleSave} disabled={!hasChanges() || isLoading}>
              <Save className="h-4 w-4 mr-2" />
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
                    <SelectItem value="none">None</SelectItem>
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
                    <SelectItem value="none">None</SelectItem>
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
                    <SelectItem value="none">None</SelectItem>
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
