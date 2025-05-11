"use client";

import Link from "next/link";
import { Book } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Footer } from "@/components/footer";

export default function RefundAndCancellationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Journal</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/landing">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Refund and Cancellation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Refund and Cancellation Policy</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Free and Premium Services</h2>
              <p className="mb-3">
                The Journal App currently offers a free service for all users. Premium features may be added in the future, which might require payment.
              </p>
              <p>
                This policy outlines our approach to refunds and account cancellations for both our current free service and any future premium offerings.
              </p>
            </section>

            <section className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-md border border-emerald-100 dark:border-emerald-800">
              <h3 className="text-lg font-medium mb-2 text-emerald-700 dark:text-emerald-400">Free Service</h3>
              <p>
                Since the Journal App is currently offered as a free service, no refund policy is applicable at this time. You can cancel your account at any time without any charges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Account Cancellation</h2>
              <p className="mb-3">
                You may cancel your Journal App account at any time by following these steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your Journal App account</li>
                <li>Navigate to the Settings page</li>
                <li>Scroll to the bottom and click "Delete Account"</li>
                <li>Confirm your decision by following the prompts</li>
              </ol>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-md">
                <p className="text-amber-800 dark:text-amber-400 font-medium">Important:</p>
                <p className="text-sm mt-1">Account deletion is permanent. All your journal entries and data will be permanently deleted and cannot be recovered. We recommend exporting any journal entries you wish to keep before deleting your account.</p>
              </div>
            </section>

            <section className="border-t pt-6 mt-6 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Future Premium Features</h2>
              <p className="mb-3">
                If we introduce premium features in the future, the following refund policy will apply:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We may offer a 14-day refund period for new premium subscriptions</li>
                <li>Refund requests must be submitted within 14 days of the initial purchase</li>
                <li>Refunds will be processed using the original payment method</li>
                <li>Processing time for refunds may vary depending on your payment provider</li>
              </ul>
              <p className="mt-4">
                Premium subscriptions (if offered in the future) can be canceled at any time from your account settings. After cancellation, you will continue to have access to premium features until the end of your current billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Contact Us</h2>
              <p className="mb-3">
                If you have any questions about this Refund and Cancellation Policy, please contact us at:
              </p>
              <a 
                href="mailto:support@journaldigitizer.com" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                support@journaldigitizer.com
              </a>
            </section>

            <p className="text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
              Last Updated: July 15, 2023
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer isOnline={true} />
    </div>
  );
}