"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Save, User as UserIcon, Camera, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Initialize display name state when user/profile data loads
  useEffect(() => {
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    } else if (user?.displayName) {
      setDisplayName(user.displayName);
    } else {
      setDisplayName(""); // Default if no name found
    }
  }, [userProfile, user]); // Depend on both

  const handleNameUpdate = async () => {
    // Prevent saving if name hasn't changed or is empty (optional check)
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName === currentDisplayName) {
      setIsEditingName(false); // Exit edit mode if name is same or empty
      setDisplayName(currentDisplayName); // Reset input to current name
      return;
    }

    setIsSavingName(true);
    try {
      await updateUserProfile({ displayName: trimmedName });
      toast({ title: "Success", description: "Display name updated." });
      setIsEditingName(false); // Exit edit mode on success
    } catch (error) {
      console.error("Failed to update display name:", error);
      toast({ title: "Error", description: "Could not update display name.", variant: "destructive" });
      // Optionally reset name input to previous value on error
      // setDisplayName(currentDisplayName); 
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    // Basic type check
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File Type", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        toast({ title: "Error", description: "Could not read image file.", variant: "destructive" });
        setIsUploadingPhoto(false);
        return;
      }

      try {
        // --- Optional but Recommended: Image Compression/Resizing --- 
        // TODO: Add logic here to resize the image using a Canvas 
        // to a reasonable dimension (e.g., max 512x512) and desired format/quality 
        // to reduce the size of the dataUrl before saving to IndexedDB.
        // Example: const compressedDataUrl = await compressImage(dataUrl, 512, 0.8);
        const finalDataUrl = dataUrl; // Replace with compressedDataUrl if implemented
        // --- End Compression --- 

        await updateUserProfile({ photoDataUrl: finalDataUrl });
        toast({ title: "Success", description: "Profile picture updated." });

      } catch (error) {
        console.error("Failed to update profile picture:", error);
        toast({ title: "Error", description: "Could not update profile picture.", variant: "destructive" });
      } finally {
        setIsUploadingPhoto(false);
        // Reset file input value so the same file can be chosen again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated (or show login prompt)
    // This might already be handled by layout or middleware
    router.push("/login"); 
    return null; // Return null while redirecting
  }

  // Determine the name and photo source
  const currentDisplayName = userProfile?.displayName ?? user.displayName ?? "No Name Set";
  const currentPhotoUrl = userProfile?.photoDataUrl; // Prefer photo from Dexie

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="ml-4 text-xl font-semibold">Profile</h1>
        </div>
      </header>

      <main className="flex-1 container p-4 max-w-md mx-auto">
        <Card>
          <CardHeader className="items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={currentPhotoUrl} alt={currentDisplayName} />
                <AvatarFallback>
                  {isUploadingPhoto ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <UserIcon className="h-12 w-12" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-4 right-0 rounded-full bg-background"
                onClick={triggerFileInput}
                disabled={isUploadingPhoto}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change Photo</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <CardTitle className="text-center text-2xl">
              {isEditingName ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-center text-2xl h-auto p-0 border-0 shadow-none focus-visible:ring-0"
                  autoFocus
                  onBlur={() => !isSavingName && setIsEditingName(false)} // Hide input on blur if not saving
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNameUpdate(); }}
                />
              ) : (
                <span onClick={() => setIsEditingName(true)} className="cursor-pointer hover:opacity-80">
                  {currentDisplayName}
                </span>
              )}
            </CardTitle>
            <div className="text-muted-foreground flex items-center text-sm mt-1">
               <Mail className="h-4 w-4 mr-1" />
               {user.email}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            {/* Name Edit Section */}
            <div className="space-y-2">
               <Label htmlFor="displayName">Display Name</Label>
               <div className="flex items-center space-x-2">
                  <Input 
                     id="displayName" 
                     value={displayName} 
                     onChange={(e) => setDisplayName(e.target.value)} 
                     disabled={!isEditingName || isSavingName}
                  />
                  <Button 
                     onClick={handleNameUpdate} 
                     disabled={isSavingName || currentDisplayName === displayName}
                     size="icon"
                     variant={isEditingName ? "default" : "ghost"}
                  >
                     {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     <span className="sr-only">Save Name</span>
                  </Button>
               </div>
            </div>

             {/* Add other profile settings sections here if needed */}

          </CardContent>
        </Card>
      </main>
    </div>
  );
} 