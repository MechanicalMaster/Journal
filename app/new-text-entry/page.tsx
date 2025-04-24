"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { RichTextEditor } from "@/components/rich-text-editor";
import { journalService } from "@/lib/journal-service";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Options (could be moved to a constants file)
const toneOptions = ["Reflective", "Analytical", "Formal", "Informal", "Critical", "Humorous"];
const topicOptions = ["Work", "Personal", "Health", "Finance", "Education", "Creativity"];
const moodOptions = ["Calm", "Energetic", "Happy", "Sad", "Anxious", "Relaxed"];
const NONE_VALUE = "none"; // Represents no selection

export default function NewTextEntryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML content
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [tone, setTone] = useState(NONE_VALUE);
  const [topic, setTopic] = useState(NONE_VALUE);
  const [mood, setMood] = useState(NONE_VALUE);
  const [context, setContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save an entry.", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title for your entry.", variant: "destructive" });
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast({ title: "Error", description: "Please write some content for your entry.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    
    try {
        const qualifiers = [
            tone !== NONE_VALUE && `Tone: ${tone}`,
            topic !== NONE_VALUE && `Topic: ${topic}`,
            mood !== NONE_VALUE && `Mood: ${mood}`,
            context && `Context: ${context}`
        ].filter(Boolean) as string[];

        await journalService.createEntry({
            userId: user.uid,
            title,
            text: content,
            images: [],
            qualifiers,
            entryDate: entryDate || new Date(),
        });

        toast({ title: "Success", description: "Entry saved successfully." });
        router.push("/entries");

    } catch (error) {
        console.error("Failed to save entry:", error);
        toast({ title: "Error", description: "Could not save the entry.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container p-4 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold flex-1 truncate">New Text Entry</h1>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Enter entry title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="entryDate">Entry Date</Label>
            <DatePicker date={entryDate} setDate={setEntryDate} />
          </div>

          <div>
            <Label>Content</Label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div>
            <Label className="text-lg font-medium">Qualifiers</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div>
                <Label htmlFor="tone-select" className="text-sm font-medium mb-1 block">Tone</Label>
                <Select value={tone} onValueChange={setTone} name="tone-select">
                  <SelectTrigger id="tone-select"><SelectValue placeholder="Select Tone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {toneOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="topic-select" className="text-sm font-medium mb-1 block">Topic</Label>
                <Select value={topic} onValueChange={setTopic} name="topic-select">
                  <SelectTrigger id="topic-select"><SelectValue placeholder="Select Topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {topicOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                 <Label htmlFor="mood-select" className="text-sm font-medium mb-1 block">Mood</Label>
                 <Select value={mood} onValueChange={setMood} name="mood-select">
                  <SelectTrigger id="mood-select"><SelectValue placeholder="Select Mood" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {moodOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="context-input" className="text-sm font-medium mb-1 block">Context</Label>
                <Input 
                  id="context-input"
                  placeholder="Context (optional)"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 