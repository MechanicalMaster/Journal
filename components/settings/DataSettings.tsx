"use client";

import { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Download, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { journalService } from "@/lib/journal-service";
import { useAuth } from "@/lib/auth-context";
import { Label } from "@/components/ui/label";

export function DataSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [compression, setCompression] = useState(() => {
    // Initialize from localStorage if available, otherwise default to "Medium"
    if (typeof window !== 'undefined') {
      return localStorage.getItem('compressionLevel') || "Medium";
    }
    return "Medium";
  });

  // Handle Export
  const handleExport = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to export data.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const entries = await journalService.exportEntriesToJson(user.uid);
      if (entries.length === 0) {
        toast({ title: "No Entries", description: "There are no entries to export." });
        return;
      }

      const jsonString = JSON.stringify(entries, null, 2); // Pretty print JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      link.download = `journal_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Export Successful", description: `Exported ${entries.length} entries.` });

    } catch (error) {
      console.error("Export failed:", error);
      toast({ title: "Export Failed", description: "Could not export journal entries.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger file input click
  const triggerImportFile = () => {
    importFileInputRef.current?.click();
  };

  // Handle Import - Triggered when file input changes
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to import data.", variant: "destructive" });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return; // No file selected
    }

    if (file.type !== 'application/json') {
      toast({ title: "Invalid File Type", description: "Please select a .json file.", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') {
        toast({ title: "Import Failed", description: "Could not read file content.", variant: "destructive" });
        setIsImporting(false);
        return;
      }

      try {
        const entriesToImport = JSON.parse(content);
        
        // Validate if it's an array (basic check)
        if (!Array.isArray(entriesToImport)) {
          throw new Error("Invalid JSON format: Expected an array of journal entries.");
        }

        const result = await journalService.importEntriesFromJson(user.uid, entriesToImport);

        let description = `Successfully imported/updated ${result.successCount} entries.`;
        if (result.errorCount > 0) {
          description += ` Skipped ${result.errorCount} entries due to errors. Check console for details.`;
          console.warn("Import errors:", result.errors);
        }

        toast({ 
          title: "Import Complete", 
          description: description,
          variant: result.errorCount > 0 ? "warning" : "default" 
        });

      } catch (error) {
        console.error("Import failed:", error);
        toast({ title: "Import Failed", description: "Could not import journal entries.", variant: "destructive" });
      } finally {
        setIsImporting(false);
        // Reset the file input so the same file can be chosen again
        if (importFileInputRef.current) {
          importFileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      toast({ title: "Import Failed", description: "Failed to read file.", variant: "destructive" });
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  // Handle Clear Data
  const handleClearData = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to clear data.", variant: "destructive" });
      return;
    }
    
    try {
      // Get all entries for the user and delete them one by one
      const {entries} = await journalService.getEntries(user.uid, 1, 1000);
      let deleteCount = 0;
      
      for (const entry of entries) {
        await journalService.deleteEntry(entry.id);
        deleteCount++;
      }
      
      toast({ title: "Data Cleared", description: `Deleted ${deleteCount} journal entries.` });
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast({ title: "Error", description: "Failed to clear data.", variant: "destructive" });
    }
  };

  // Handle Compression Change
  const handleCompressionChange = (value: string) => {
    setCompression(value);
    localStorage.setItem('compressionLevel', value);
    toast({ 
      title: "Compression Updated", 
      description: `Image compression level set to ${value}.` 
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-compression">Image Compression</Label>
            <Select value={compression} onValueChange={handleCompressionChange}>
              <SelectTrigger id="image-compression">
                <SelectValue placeholder="Select compression level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Higher compression results in smaller file sizes but lower image quality.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Backup & Restore</Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                className="flex-1"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Data
              </Button>
              <Button
                className="flex-1"
                onClick={triggerImportFile}
                disabled={isImporting}
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Import Data
              </Button>
              <input
                type="file"
                ref={importFileInputRef}
                onChange={handleImport}
                accept="application/json"
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label>Clear Data</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all journal entries and associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground">
                    Delete All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 