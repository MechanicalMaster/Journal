"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book, Settings, List, WifiOff, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

// Animation Variant
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function HomePage() {
  const router = useRouter();
  const { user, userProfile, logout, loading } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/landing");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Don't render main content until auth check is complete
  if (loading) {
    // Optional: You could return a specific loading indicator for this page
    // or rely on the layout's global loading state.
    return null; // Or a loading spinner specific to this page
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 border-b dark:border-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Journal</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

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
            onClick={() => router.push("/new-entry")}
            disabled={!isOnline}
          >
            <Book className="mr-2 h-6 w-6" />
            New Entry
          </Button>

          <Button
            size="lg"
            className="h-24 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => router.push("/entries")}
          >
            <List className="mr-2 h-6 w-6" />
            View Entries
          </Button>

          <Button
            size="lg"
            className="h-24 text-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-6 w-6" />
            Settings
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