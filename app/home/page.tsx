"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book, List, WifiOff, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";

// Animation Variant
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

function HomePageContent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  // Determine display name (prioritize Dexie profile)
  const displayName = userProfile?.displayName || user?.displayName || "Journal User";

  // Check online status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial status
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Welcome Message Section */}
      <div className="container mx-auto px-4 pt-6 text-center">
        <motion.h2 
          variants={fadeInUp} 
          initial="initial" 
          animate="animate"
          className="text-2xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Welcome back, {displayName}!
        </motion.h2>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {!isOnline && (
          <div className="flex items-center justify-center p-4 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
            <WifiOff className="h-5 w-5 mr-2" />
            <p>Connect to the internet to digitize entries.</p>
          </div>
        )}

        <div className="grid gap-6 w-full max-w-md">
          <Button
            size="lg"
            className="h-24 text-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            onClick={() => router.push("/new-text-entry")}
          >
            <Book className="mr-2 h-6 w-6" />
            Write New Entry
          </Button>
          
          <Button
            size="lg"
            className="h-24 text-lg bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800"
            onClick={() => router.push("/new-entry")}
            disabled={!isOnline}
          >
            <Camera className="mr-2 h-6 w-6" />
            Upload Entry (OCR)
          </Button>

          <Button
            size="lg"
            className="h-24 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => router.push("/entries")}
          >
            <List className="mr-2 h-6 w-6" />
            View Entries
          </Button>
        </div>
      </main>

      <footer className="border-t dark:border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Journal App</p>
        </div>
      </footer>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      {/* Skeleton Header */}
      <header className="bg-white dark:bg-gray-950 border-b dark:border-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" /> 
        </div>
      </header>

      {/* Skeleton Welcome Message */}
      <div className="container mx-auto px-4 pt-6 text-center">
        <Skeleton className="h-8 w-1/2 mx-auto" />
      </div>

      {/* Skeleton Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="grid gap-6 w-full max-w-md">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </main>

      {/* Skeleton Footer */}
      <footer className="border-t dark:border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-4 w-1/4 mx-auto" />
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return <HomePageSkeleton />;
  }

  return <HomePageContent />;
} 