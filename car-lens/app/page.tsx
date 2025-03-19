// File: app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState} from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import AnimatedLogo from "@/components/logos/animated-logo";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Handle login button click based on auth state
  const handleLoginClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1">
        <header className="container mx-auto p-4 sm:p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <AnimatedLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:text-slate-600">
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  className="h-9 bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-slate-600"
                  onClick={handleLoginClick}
                >
                  Login
                </Link>
                <Link href="/register">
                  <Button className="h-9">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white mb-4">
            <div className="container mx-auto px-4 py-3 space-y-3">
              <Link
                href="#features"
                className="block py-2 text-slate-600 hover:text-slate-900"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block py-2 text-slate-600 hover:text-slate-900"
              >
                How It Works
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-slate-600 hover:text-slate-900"
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-2 text-slate-600 hover:text-slate-900"
                    onClick={handleLoginClick}
                  >
                    Login
                  </Link>
                  <Link href="/register" className="block py-3">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Get Accurate Car Price Estimates Instantly
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-6 sm:mb-10">
            CarLens uses AI to analyze car listings and provide you with the
            most accurate price estimates. No more overpaying or underselling.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            )}
            <Link
              href={isAuthenticated ? "/dashboard" : "/dashboard?guest=true"}
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {isAuthenticated ? "View Estimates" : "Continue as Guest"}
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link
              href="#how-it-works"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Learn how it works →
            </Link>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Key Features
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="m18 16 4-4-4-4" />
                  <path d="m6 8-4 4 4 4" />
                  <path d="m14.5 4-5 16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">URL Scraping</h3>
              <p className="text-slate-600">
                Paste any car listing URL and get an instant price analysis and
                estimate.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M20 6H10m0 0H4m6 0V3" />
                  <path d="M14 8.5c1 1 1.5 2.2 1.5 3.5a5.5 5.5 0 0 1-11 0c0-1.3.5-2.5 1.5-3.5" />
                  <path d="M14 17v3m-4-3v3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-slate-600">
                DeepSeek integration provides highly accurate price estimates
                based on market data.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10v2H7z" />
                  <path d="M7 11h10v2H7z" />
                  <path d="M7 15h4v2H7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manual Entry</h3>
              <p className="text-slate-600">
                Don&apos;t have a URL? Enter car details manually to get a price
                estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Car Details</h3>
              <p className="text-slate-600">
                Paste a URL or enter car information manually in our simple
                form.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-slate-600">
                Our AI engine processes the information and compares against
                market data.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Estimate</h3>
              <p className="text-slate-600">
                Receive an accurate price estimate with confidence rating in
                seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block mx-auto mb-4 px-3 py-1 border-2 border-blue-500 rounded-lg">
            <span className="font-bold text-xl sm:text-2xl">
              Car<span className="text-blue-400">Lens</span>
            </span>
          </div>
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} CarLens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
