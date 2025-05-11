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

export default function ContactUsPage() {
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
              <BreadcrumbPage>Contact Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Contact Us</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Get in Touch</h2>
              <p className="mb-4">
                We're here to help with any questions or feedback you may have about the Journal App. Please feel free to reach out using the contact information below.
              </p>
            </section>

            <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Email Support</h3>
              <p className="mb-2">
                For general inquiries, feature requests, or assistance:
              </p>
              <a 
                href="mailto:support@journaldigitizer.com" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                support@journaldigitizer.com
              </a>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Support Hours</h3>
              <p>Our team is available to assist you Monday through Friday, 9:00 AM to 5:00 PM (EST).</p>
              <p className="mt-2">We strive to respond to all inquiries within 24-48 business hours.</p>
            </section>

            <section className="border-t pt-6 mt-6 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Privacy Concerns</h3>
              <p className="mb-2">
                We take your privacy seriously. For questions related to data privacy or our privacy policy:
              </p>
              <a 
                href="mailto:privacy@journaldigitizer.com" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                privacy@journaldigitizer.com
              </a>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                For more details about how we handle your data, please review our{" "}
                <Link href="/termsandconditions" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Terms and Conditions
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer isOnline={true} />
    </div>
  );
}