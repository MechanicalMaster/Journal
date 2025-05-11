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

export default function TermsAndConditionsPage() {
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
              <BreadcrumbPage>Terms and Conditions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Terms and Conditions</h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing or using the Journal App, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you may not access or use the app.
              </p>
              <p>
                We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting the modified terms. Your continued use of the Journal App means you accept those modifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">2. Privacy Policy</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our app. By using the Journal App, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">3. User Accounts</h2>
              <p className="mb-3">
                You are responsible for safeguarding the password you use to access the Journal App and for any activities or actions under your password.
              </p>
              <p>
                We encourage you to use a strong, unique password and to log out from your account at the end of each session. We cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">4. Journal Content and Ownership</h2>
              <p className="mb-3">
                The Journal App allows you to create and store personal journal entries. You retain all ownership rights to your journal entries.
              </p>
              <p className="mb-3">
                We do not claim ownership over your journal content, but you grant us a license to store and process your content solely for the purpose of providing the Journal App service to you.
              </p>
              <p>
                Your journal entries are stored locally on your device using IndexedDB. We do not have access to your journal entries unless you explicitly choose to export or share them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">5. OCR Technology</h2>
              <p className="mb-3">
                The Journal App uses optical character recognition (OCR) technology to convert images of text into machine-encoded text. While we strive to provide accurate OCR results, we do not guarantee 100% accuracy.
              </p>
              <p>
                You are responsible for reviewing and correcting any errors in the OCR-generated text.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">6. Prohibited Uses</h2>
              <p className="mb-3">
                You agree not to use the Journal App:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                <li>To transmit any material that contains viruses, trojan horses, or other harmful computer code</li>
                <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the service</li>
                <li>To conduct any systematic or automated data collection activities on or in relation to our service without our express written consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">7. Limitation of Liability</h2>
              <p className="mb-3">
                In no event shall the Journal App, its operators, or its suppliers be liable for any consequential, indirect, incidental, special, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses resulting from the use of or inability to use the service.
              </p>
              <p>
                We highly recommend regularly backing up your journal entries to prevent data loss.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">8. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">9. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at{" "}
                <a href="mailto:support@journaldigitizer.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  support@journaldigitizer.com
                </a>.
              </p>
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