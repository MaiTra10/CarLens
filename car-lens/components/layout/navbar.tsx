"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import AnimatedLogo from "../logos/animated-logo";

interface NavbarProps {
  isGuestMode?: boolean;
}

export default function Navbar({ isGuestMode = false }: NavbarProps) {
  const [user] = useState(isGuestMode ? null : {
    name: "Demo User",
    email: "user@example.com",
    avatarUrl: ""
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    console.log("Logging out...");
    window.location.href = "/";
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <AnimatedLogo />
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
            {!isGuestMode && (
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
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
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
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "G"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history">Estimate History</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <Link href="/dashboard" className="block py-2 text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            {!isGuestMode && (
              <Link href="/history" className="block py-2 text-slate-600 hover:text-slate-900">
                History
              </Link>
            )}
            <Link href="/help" className="block py-2 text-slate-600 hover:text-slate-900">
              Help
            </Link>
            
            <div className="pt-3 border-t border-gray-100">
              {isGuestMode ? (
                <div className="flex flex-col space-y-2">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full" size="sm">Create Account</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start" size="sm">Profile</Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start" size="sm">Settings</Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="ghost" className="w-full justify-start" size="sm">Estimate History</Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}