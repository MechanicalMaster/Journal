"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Tag, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export default function QualifiersScreen() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    // In a real app, you would save the entry with all qualifiers
    console.log("Saving entry with qualifiers:", { date, title, category, tags, notes })
    router.push("/entries")
  }

  const goBack = () => {
    router.push("/extract")
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
          <Button onClick={handleSave}>
            <Save className="mr-2 h-5 w-5" />
            Save Entry
          </Button>
        </div>
      </header>

      <main className="flex-1 container p-4 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-gray-400" />
              <Input
                id="title"
                placeholder="Enter a title for this entry"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-gray-400" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="ideas">Ideas</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-gray-400" />
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this entry"
              className="min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
