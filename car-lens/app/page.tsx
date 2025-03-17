import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1">
        <header className="container mx-auto p-6 flex justify-between items-center">
          <div className="font-bold text-2xl">CarLens</div>
          <nav className="space-x-6">
            <Link href="#features" className="hover:text-slate-600">Features</Link>
            <Link href="#how-it-works" className="hover:text-slate-600">How It Works</Link>
            <Link href="/login" className="hover:text-slate-600">Login</Link>
            <Link href="/register">
              <Button className="hover:cursor-pointer">Sign Up</Button>
            </Link>
          </nav>
        </header>

        <section className="container mx-auto px-6 py-16 flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Get Accurate Car Price Estimates Instantly
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mb-10">
            CarLens uses AI to analyze car listings and provide you with the most accurate price estimates. No more overpaying or underselling.
          </p>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg" className="hover:cursor-pointer">Get Started</Button>
            </Link>
            <Link href="/dashboard?guest=true">
              <Button variant="outline" size="lg" className="hover:cursor-pointer">Continue as Guest</Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">
              Learn how it works →
            </Link>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="m18 16 4-4-4-4" />
                  <path d="m6 8-4 4 4 4" />
                  <path d="m14.5 4-5 16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">URL Scraping</h3>
              <p className="text-slate-600">
                Paste any car listing URL and get an instant price analysis and estimate.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M20 6H10m0 0H4m6 0V3" />
                  <path d="M14 8.5c1 1 1.5 2.2 1.5 3.5a5.5 5.5 0 0 1-11 0c0-1.3.5-2.5 1.5-3.5" />
                  <path d="M14 17v3m-4-3v3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-slate-600">
                DeepSeek integration provides highly accurate price estimates based on market data.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10v2H7z" />
                  <path d="M7 11h10v2H7z" />
                  <path d="M7 15h4v2H7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manual Entry</h3>
              <p className="text-slate-600">
                Dont have a URL? Enter car details manually to get a price estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Car Details</h3>
              <p className="text-slate-600">
                Paste a URL or enter car information manually in our simple form.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-slate-600">
                Our AI engine processes the information and compares against market data.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Estimate</h3>
              <p className="text-slate-600">
                Receive an accurate price estimate with confidence rating in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="font-bold text-2xl mb-4">CarLens</div>
              <p className="text-slate-400 max-w-md">
                The most accurate car price estimation tool powered by AI.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-slate-400 hover:text-white">Features</Link></li>
                  <li><Link href="#how-it-works" className="text-slate-400 hover:text-white">How It Works</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-slate-400 hover:text-white">About</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white">Blog</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-slate-400 hover:text-white">Privacy</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white">Terms</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white">Cookies</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} CarLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}