"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  SortDesc,
  SortAsc,
  Download,
  Calendar,
  Tag,
  BookOpen,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { journalService } from "@/lib/journal-service"
import { useToast } from "@/components/ui/use-toast"
import { JournalEntry } from "@/lib/db"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Mock data for entries
const mockEntries: JournalEntry[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))

  const tones = ["Playful", "Serious", "Sarcastic", "Reflective", "Upbeat", "Melancholic"]
  const topics = ["Work", "Life", "Family", "Health", "Travel", "Learning"]
  const moods = ["Happy", "Sad", "Anxious", "Calm", "Excited", "Tired"]

  const randomTone = tones[Math.floor(Math.random() * tones.length)]
  const randomTopic = topics[Math.floor(Math.random() * topics.length)]
  const randomMood = moods[Math.floor(Math.random() * moods.length)]

  const qualifiers = [randomTone, randomTopic, randomMood]

  const texts = [
    "Today I started working on a new project that I'm really excited about.",
    "Had a great conversation with my family about our upcoming vacation plans.",
    "Feeling a bit under the weather today, but managed to get some work done.",
    "Reflecting on the past year and all the changes that have happened.",
    "Made significant progress on my personal goals this week.",
  ]

  const text = texts[Math.floor(Math.random() * texts.length)]

  return {
    id: `ENTRY-${id.toString().padStart(4, "0")}`,
    userId: "mock-user",
    title: `Entry ${id}`,
    text,
    images: [],
    qualifiers,
    entryDate: date,
    createdAt: date,
    updatedAt: date,
  }
})

// Filter options
const filterOptions = {
  tones: ["Playful", "Serious", "Sarcastic", "Reflective", "Upbeat", "Melancholic"],
  topics: ["Work", "Life", "Family", "Health", "Travel", "Learning"],
  moods: ["Happy", "Sad", "Anxious", "Calm", "Excited", "Tired"],
}

export default function EntriesListScreen() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [isEntriesLoading, setIsEntriesLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    tones: string[]
    topics: string[]
    moods: string[]
  }>({
    tones: [],
    topics: [],
    moods: [],
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json")
  const [showExportDialog, setShowExportDialog] = useState(false)

  const ENTRIES_PER_PAGE = 20

  const fetchEntries = async (pageToFetch: number, append: boolean = false) => {
      if (!user) {
      setEntries([]);
      setTotalEntries(0);
      setIsEntriesLoading(false);
      return;
      }

    setIsEntriesLoading(true);
      try {
      const { entries: fetchedEntries, totalCount } = await journalService.getEntries(
        user.uid,
        pageToFetch,
        ENTRIES_PER_PAGE
      );
      
      setEntries(prevEntries => append ? [...prevEntries, ...fetchedEntries] : fetchedEntries);
      setTotalEntries(totalCount);
      setCurrentPage(pageToFetch);

      } catch (error) {
      console.error('Error fetching entries:', error);
        toast({
          title: "Error loading entries",
          description: "There was a problem loading your journal entries.",
          variant: "destructive",
      });
    } finally {
      setIsEntriesLoading(false);
      }
    }

  useEffect(() => {
    fetchEntries(1);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEntries(1);
    }
  }, [sortOrder, user]);

  useEffect(() => {
    if (user) {
      fetchEntries(1);
    }
  }, [activeFilters, user]);

  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          (entry.title && entry.title.toLowerCase().includes(query)) ||
          entry.text.toLowerCase().includes(query) || 
          entry.qualifiers.some((q: string) => q.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
        const dateA = new Date(a.entryDate).getTime()
        const dateB = new Date(b.entryDate).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    });
    
    return result;
  }, [entries, searchQuery, sortOrder]);

  const loadMoreEntries = () => {
    if (!isEntriesLoading && entries.length < totalEntries) {
      fetchEntries(currentPage + 1, true);
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
  }

  const toggleFilter = (category: "tones" | "topics" | "moods", value: string) => {
    setActiveFilters((prev) => {
      const isActive = prev[category].includes(value)

      return {
        ...prev,
        [category]: isActive ? prev[category].filter((item) => item !== value) : [...prev[category], value],
      }
    })
  }

  const clearFilters = () => {
    setActiveFilters({
      tones: [],
      topics: [],
      moods: [],
    })
  }

  const getTotalActiveFilters = () => {
    return activeFilters.tones.length + activeFilters.topics.length + activeFilters.moods.length
  }

  const startExport = () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export process
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExporting(false)
            setShowExportDialog(false)
            // In a real app, you would trigger the download here
          }, 500)
        }
        return newProgress
      })
    }, 300)
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const goToEntryDetails = (entryId: string) => {
    router.push(`/entries/${entryId}`)
  }

  const goBack = () => {
    router.push("/")
  }

  const handleDelete = async (entryId: string) => {
    try {
      await journalService.deleteEntry(entryId)
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId))
      
      toast({
        title: "Entry deleted",
        description: "The journal entry has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast({
        title: "Error deleting entry",
        description: "There was a problem deleting the journal entry.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span className="sr-only">Go back</span>
          </Button>
          
          <h1 className="text-lg font-semibold hidden sm:block">Journal Entries</h1>

          <div className="flex-1 mx-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search entries..."
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button className="absolute right-2.5 top-2.5" onClick={clearSearch}>
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterSheetOpen(true)}
              className={cn(getTotalActiveFilters() > 0 && "relative")}
            >
              <Filter className="h-4 w-4" />
              {getTotalActiveFilters() > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-medium text-primary-foreground">
                  {getTotalActiveFilters()}
                </span>
              )}
              <span className="sr-only">Filter</span>
            </Button>

            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              <span className="sr-only">Sort</span>
            </Button>

            <Button variant="outline" size="icon" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Export</span>
            </Button>
            
            {/* User profile avatar - uses the same structure as in the Header component */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.photoURL || undefined} 
                      alt={user?.displayName || 'User'} 
                    />
                    <AvatarFallback>
                      {user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="font-medium">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile?tab=settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={async () => {
                  try {
                    await logout();
                    router.push("/landing");
                  } catch (error) {
                    console.error("Failed to log out:", error);
                    toast({
                      title: "Logout Failed",
                      description: "There was a problem logging out.",
                      variant: "destructive",
                    });
                  }
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container p-4 space-y-4">
        {isEntriesLoading && entries.length === 0 ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No entries found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {searchQuery || getTotalActiveFilters() > 0
                ? "Try adjusting your search or filters"
                : "Start by creating your first journal entry"}
            </p>
            {(searchQuery || getTotalActiveFilters() > 0) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  clearFilters()
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredAndSortedEntries.length} of {totalEntries} entries {searchQuery || getTotalActiveFilters() > 0 ? "(filtered)" : ""}
            </div>

            <div className="grid gap-4">
              {filteredAndSortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => entry.id && goToEntryDetails(entry.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{entry.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(entry.entryDate)}
                      </p>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                        {entry.text}
                      </p>
                      {entry.images && entry.images.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {entry.images.map((image: string, index: number) => (
                            <div key={index} className="relative h-16 w-16">
                              <img
                                src={image}
                                alt={`Entry image ${index + 1}`}
                                className="h-full w-full object-cover rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        entry.id && handleDelete(entry.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {entries.length < totalEntries && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={loadMoreEntries} disabled={isEntriesLoading}>
                  {isEntriesLoading ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Entries</SheetTitle>
            <SheetDescription>Select filters to narrow down your journal entries</SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tone
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {filterOptions.tones.map((tone) => (
                  <div key={tone} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tone-${tone}`}
                      checked={activeFilters.tones.includes(tone)}
                      onCheckedChange={() => toggleFilter("tones", tone)}
                    />
                    <Label htmlFor={`tone-${tone}`}>{tone}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Topic
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {filterOptions.topics.map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topic-${topic}`}
                      checked={activeFilters.topics.includes(topic)}
                      onCheckedChange={() => toggleFilter("topics", topic)}
                    />
                    <Label htmlFor={`topic-${topic}`}>{topic}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Mood
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {filterOptions.moods.map((mood) => (
                  <div key={mood} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mood-${mood}`}
                      checked={activeFilters.moods.includes(mood)}
                      onCheckedChange={() => toggleFilter("moods", mood)}
                    />
                    <Label htmlFor={`mood-${mood}`}>{mood}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="flex flex-row justify-between sm:justify-between gap-2">
            <Button variant="outline" onClick={clearFilters} disabled={getTotalActiveFilters() === 0}>
              Clear All
            </Button>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Entries</DialogTitle>
            <DialogDescription>Export your journal entries to a file format of your choice.</DialogDescription>
          </DialogHeader>

          {isExporting ? (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <p className="mb-2">Exporting entries...</p>
                <Progress value={exportProgress} className="h-2" />
                <p className="mt-2 text-sm text-gray-500">{exportProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="format-json"
                      checked={exportFormat === "json"}
                      onCheckedChange={() => setExportFormat("json")}
                    />
                    <Label htmlFor="format-json">JSON</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="format-csv"
                      checked={exportFormat === "csv"}
                      onCheckedChange={() => setExportFormat("csv")}
                    />
                    <Label htmlFor="format-csv">CSV</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Scope</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="scope-all" defaultChecked />
                    <Label htmlFor="scope-all">All Entries</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="scope-filtered" disabled={filteredAndSortedEntries.length === entries.length} />
                    <Label htmlFor="scope-filtered">Filtered Entries ({filteredAndSortedEntries.length})</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {!isExporting && (
              <>
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={startExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
