import { Wifi, WifiOff } from "lucide-react"
import Link from "next/link"

interface FooterProps {
  isOnline: boolean
}

export function Footer({ isOnline }: FooterProps) {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-4 px-4 bg-white dark:bg-gray-950">
      <div className="container flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/contactus" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Contact Us
            </Link>
            <Link href="/termsandconditions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/refundandcancellation" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Refund & Cancellation
            </Link>
          </div>
          
          <div className="flex items-center justify-center sm:justify-end text-sm mt-4 sm:mt-0">
            {isOnline ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Ready</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center sm:justify-start">
          <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  )
}
