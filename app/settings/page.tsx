"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Moon, Sun, Bell, Lock, Trash2, Info, Mail, FileText, Fingerprint, Upload, Download, Loader2, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon } from "lucide-react"
import { journalService } from "@/lib/journal-service"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const importFileInputRef = useRef<HTMLInputElement>(null)

  // Settings state
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [compression, setCompression] = useState(() => {
    // Initialize from localStorage if available, otherwise default to "Medium"
    if (typeof window !== 'undefined') {
      return localStorage.getItem('compressionLevel') || "Medium"
    }
    return "Medium"
  })
  const [requireAuth, setRequireAuth] = useState(false)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [biometricsAvailable, setBiometricsAvailable] = useState(true)
  const [useBiometrics, setUseBiometrics] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // App info
  const appVersion = "1.0.0"
  const contactEmail = "support@journaldigitizer.com"
  const privacyPolicyUrl = "https://journaldigitizer.com/privacy"

  // Handle authentication toggle
  const handleAuthToggle = (checked: boolean) => {
    if (checked) {
      setShowPinDialog(true)
    } else {
      setRequireAuth(false)
      toast({
        title: "Authentication disabled",
        description: "You will no longer need to authenticate to access the app.",
      })
    }
  }

  // Handle PIN setup
  const handlePinSetup = () => {
    if (pin.length < 4) {
      setPinError("PIN must be at least 4 digits")
      return
    }

    if (pin !== confirmPin) {
      setPinError("PINs do not match")
      return
    }

    setRequireAuth(true)
    setShowPinDialog(false)
    setPinError("")
    setPin("")
    setConfirmPin("")

    toast({
      title: "Authentication enabled",
      description: "You will now need to authenticate to access the app.",
    })
  }

  // Handle biometrics toggle
  const handleBiometricsToggle = (checked: boolean) => {
    setUseBiometrics(checked)

    if (checked) {
      toast({
        title: "Biometric authentication enabled",
        description: "You can now use your fingerprint or face to unlock the app.",
      })
    }
  }

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
        
        // Optional: Force refresh or navigate to entries page
        // router.push('/entries'); 

      } catch (error) {
        console.error("Import failed:", error);
        toast({ title: "Import Failed", description: `Error processing file: ${(error as Error).message}`, variant: "destructive" });
      } finally {
        setIsImporting(false);
        // Reset file input so the same file can be selected again if needed
        if (importFileInputRef.current) {
          importFileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      toast({ title: "Import Failed", description: "Error reading file.", variant: "destructive" });
      setIsImporting(false);
       // Reset file input
       if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Function to trigger file input click
  const triggerImportFile = () => {
    importFileInputRef.current?.click();
  };

  // Handle clear data
  const handleClearData = () => {
    // In a real app, you would clear the database here
    toast({
      title: "Data cleared",
      description: "All entries have been deleted.",
      variant: "destructive",
    })
  }

  // Handle compression change
  const handleCompressionChange = (value: string) => {
    setCompression(value)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('compressionLevel', value)
    }

    toast({
      title: "Compression setting saved",
      description: `Image compression set to ${value}.`,
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="ml-4 text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="flex-1 container p-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <h2 className="text-lg font-medium">Appearance</h2>
            <Separator className="my-2" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>

          {/* Compression Settings */}
          <div>
            <h2 className="text-lg font-medium">Image Compression</h2>
            <Separator className="my-2" />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <Label htmlFor="compression">Compression Level</Label>
              </div>

              <Select value={compression} onValueChange={handleCompressionChange}>
                <SelectTrigger id="compression">
                  <SelectValue placeholder="Select compression level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground">
                None: No compression, Low: Minimal resize, Medium: Balanced, High: Aggressive compression
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-medium">Notifications</h2>
            <Separator className="my-2" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <Label htmlFor="notifications">Enable Notifications</Label>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-lg font-medium">Security</h2>
            <Separator className="my-2" />
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <Label htmlFor="require-auth">Require PIN or device login</Label>
                </div>
                <Switch id="require-auth" checked={requireAuth} onCheckedChange={handleAuthToggle} />
              </div>

              {requireAuth && biometricsAvailable && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="h-5 w-5" />
                    <Label htmlFor="use-biometrics">Use biometric authentication</Label>
                  </div>
                  <Switch id="use-biometrics" checked={useBiometrics} onCheckedChange={handleBiometricsToggle} />
                </div>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h2 className="text-lg font-medium">Data Management</h2>
            <Separator className="my-2" />
            <div className="space-y-4 py-2">
              {/* Export Button */}
              <Button 
                variant="outline"
                className="w-full justify-start"
                onClick={handleExport}
                disabled={isExporting || isImporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Journal Data (.json)
              </Button>

              {/* Import Button / File Input */}
              <Button 
                variant="outline"
                className="w-full justify-start"
                onClick={triggerImportFile} 
                disabled={isImporting || isExporting}
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import Journal Data (.json)
              </Button>
              <input
                type="file"
                ref={importFileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden" // Hide the actual file input
              />

              {/* Clear Data Button (Existing) */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Local Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all local data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all journal entries stored in this browser. This action cannot be undone. Export your data first if you want a backup.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {/* Make sure the action calls the correct handler */}
                    <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Clear Data
                          </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Profile Link/Button */}
          <div>
            <h2 className="text-lg font-medium">Profile</h2>
            <Separator className="my-2" />
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/profile')}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile (Name & Picture)
            </Button>
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-lg font-medium">About</h2>
            <Separator className="my-2" />
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Version</span>
                  </div>
                  <span className="text-sm">{appVersion}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Contact</span>
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {contactEmail}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Privacy Policy</span>
                  </div>
                  <a
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* PIN Setup Dialog */}
      <Dialog
        open={showPinDialog}
        onOpenChange={(open) => {
          setShowPinDialog(open)
          if (!open) {
            setPin("")
            setConfirmPin("")
            setPinError("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up PIN</DialogTitle>
            <DialogDescription>
              Create a PIN to secure your journal entries. You'll need to enter this PIN each time you open the app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Enter PIN (minimum 4 digits)</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm PIN"
              />
            </div>

            {pinError && <p className="text-sm text-red-500">{pinError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePinSetup}>Set PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
