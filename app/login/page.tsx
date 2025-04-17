"use client";

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Book } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="border-b bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/landing" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Journal</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </div>
  );
} 