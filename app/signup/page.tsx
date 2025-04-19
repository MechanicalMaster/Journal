"use client";

import { SignUpForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Book } from "lucide-react";

export default function SignUpPage() {
  return (
    <div 
      className="min-h-screen flex flex-col"
    >
       {/* Dark mode specific background can be handled via CSS or logic if needed */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/landing" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Journal</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </main>
    </div>
  );
} 