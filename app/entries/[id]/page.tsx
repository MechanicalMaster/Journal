"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function EntryDetailsScreen({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // In a real app, you would fetch the entry data based on the ID
  const entryId = params.id

  // Mock entry data
  const entry = {
    id: entryId,
    date: new Date().toISOString(),
    title: "Morning Reflections",
    text: "Today I woke up feeling energized and ready to tackle the day. My first meeting went well, though there were some concerns about the timeline. I need to follow up with Sarah about the project deliverables by Friday.\n\nThings to remember:\n- Buy groceries\n- Schedule dentist appointment\n- Finish reading chapter 5",
    qualifiers: ["Reflective", "Work", "Calm"],
    images: [
      "/placeholder.svg?height=800&width=600&text=Journal+Page+1",
      "/placeholder.svg?height=800&width=600&text=Journal+Page+2",
    ],
    category: "Work",
    tags: ["meeting", "project", "tasks"],
    notes: "This was written during my morning coffee break.",
  }

  const formatDate = (dateString: string) => {
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

  const handleDelete = () => {
    // In a real app, you would show a confirmation dialog
    setIsLoading(true)

    // Simulate deletion
    setTimeout(() => {
      setIsLoading(false)
      router.push("/entries")
    }, 1000)
  }

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
            <Button variant="outline" size="icon" className="text-red-500" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container p-4 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{entry.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{formatDate(entry.date)}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.qualifiers.map((qualifier, i) => (
                <Badge key={i} variant="secondary">
                  {qualifier}
                </Badge>
              ))}
            </div>
          </div>

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
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                  <dd>{entry.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {entry.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd>{entry.notes}</dd>
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
