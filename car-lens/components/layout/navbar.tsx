"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import AnimatedLogo from "../logos/animated-logo";

interface NavbarProps {
  isGuestMode?: boolean;
}

export default function Navbar({ isGuestMode = false }: NavbarProps) {
  const { isAuthenticated, logout, userEmail } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const getInitials = (email: string | null) => {
    // If email is not available, return generic user initial
    if (!email) return "U";
    
    // Try to get initials from email address
    // For example, john.doe@example.com becomes "JD"
    const namePart = email.split('@')[0];
    const parts = namePart.split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    // If no separators, just return first letter (or first two letters)
    return (namePart.slice(0, 2)).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <AnimatedLogo/>
          </Link>
          {isGuestMode && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              Guest
            </span>
          )}
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex ml-8 space-x-6">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            {!isGuestMode && isAuthenticated && (
              <Link href="/history" className="text-slate-600 hover:text-slate-900">
                History
              </Link>
            )}
            <Link href="/help" className="text-slate-600 hover:text-slate-900">
              Help
            </Link>
          </nav>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            data-mobile-menu
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        {/* Desktop User Menu or Sign In/Register Buttons */}
        <div className="hidden md:flex items-center">
          {isGuestMode ? (
            <div className="space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Create Account</Button>
              </Link>
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userEmail || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Create Account</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-md" data-mobile-menu>
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link 
              href="/dashboard" 
              className="block py-3 text-slate-600 hover:text-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {!isGuestMode && isAuthenticated && (
              <Link 
                href="/history" 
                className="block py-3 text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                History
              </Link>
            )}
            <Link 
              href="/help" 
              className="block py-3 text-slate-600 hover:text-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            
            <div className="pt-3 border-t border-gray-100">
              {isGuestMode ? (
                <div className="flex flex-col space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full h-10 text-center justify-center" 
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      className="w-full h-10 text-center justify-center"
                    >
                      Create Account
                    </Button>
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  {userEmail && (
                    <div className="px-2 py-1 text-sm text-slate-500">
                      Signed in as: {userEmail}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full h-10 text-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50" 
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full h-10 text-center justify-center" 
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      className="w-full h-10 text-center justify-center"
                    >
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}