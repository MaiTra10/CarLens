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

interface NavbarProps {
  isGuestMode?: boolean;
}

export default function Navbar({ isGuestMode = false }: NavbarProps) {
  // In a real app, you'd get user info from a session
  const [user] = useState(isGuestMode ? null : {
    name: "Demo User",
    email: "user@example.com",
    avatarUrl: ""
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Mock logout function
  const handleLogout = () => {
    console.log("Logging out...");
    // In real app: signOut() or similar auth function
    window.location.href = "/";
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-2xl">
            CarLens
          </Link>
          {isGuestMode && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              Guest
            </span>
          )}
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
        
        <div className="flex items-center">
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
    </header>
  );
}