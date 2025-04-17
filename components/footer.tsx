import { Wifi, WifiOff } from "lucide-react"

interface FooterProps {
  isOnline: boolean
}

export function Footer({ isOnline }: FooterProps) {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-4 px-4 bg-white dark:bg-gray-950">
      <div className="container flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>

        <div className="flex items-center text-sm">
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
    </footer>
  )
}
