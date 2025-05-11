"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, ArrowRight, Lock, ScanText, Sparkles, LayoutPanelLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Footer } from "@/components/footer";

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const featureHover = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 300 },
};

// Feature Data
const features = [
  {
    icon: Lock,
    title: "Private by Design",
    description: "Your journal entries and images are stored securely on your device using IndexedDB. No cloud uploads unless you explicitly export.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20"
  },
  {
    icon: ScanText,
    title: "Instant Text Extraction",
    description: "Our advanced OCR technology accurately converts your handwritten notes from images into editable digital text in seconds.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    icon: Sparkles,
    title: "Clean & Intuitive UI",
    description: "Enjoy a beautifully simple and clutter-free interface with streamlined settings for a seamless journaling experience.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20"
  },
   {
    icon: LayoutPanelLeft,
    title: "Effortless Organization",
    description: "Easily add qualifiers like mood or topic to your entries, making them simple to find and reflect upon later.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20"
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Header/Navigation */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Journal</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center text-center px-4 py-16 md:py-24">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
          >
            Capture Your Thoughts,
            <br className="hidden md:block" />
            <span className="text-emerald-600">Instantly & Privately</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10"
          >
            Turn your handwritten journal pages into searchable digital text, right on your device. Simple, secure, and yours alone.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto">
                Already have an account?
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.5 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16"
          >
            Why Choose This Journal App?
          </motion.h2>
          <motion.div
            initial="initial"
            whileInView="animate" // Animate when section scrolls into view
            viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% visible
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp} whileHover={featureHover}>
                 <Card className={`h-full overflow-hidden ${feature.bg} border-none shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <CardHeader className="p-6">
                     <div className={`w-12 h-12 rounded-lg ${feature.bg.replace('bg-', 'dark:bg-').replace('/20', '/30')} flex items-center justify-center mb-4 ring-1 ring-inset ring-gray-900/10 dark:ring-white/10`}>
                       <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
                    <CardTitle className="text-xl font-semibold mb-1">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer isOnline={true} />
    </div>
  );
} 