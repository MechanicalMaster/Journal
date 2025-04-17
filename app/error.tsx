'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="border-b bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Journal</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold">Something went wrong!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We're sorry, but there was an error processing your request.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset}>
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 