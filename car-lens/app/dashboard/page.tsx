// File: app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import { ClientCarForms } from "@/components/car-form/client-car-forms";
import { EstimateHistory } from "@/components/car-form/estimate-history";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/context/protected-route";

// Define the Estimate type
export type Estimate = {
  id: string;
  makeModel: string;
  year: number;
  mileage: number;
  condition?: string;
  features?: string;
  estimatedPrice: number;
  createdAt: Date;
  isScraped: boolean;
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  
  // If not guest mode, wrap content in ProtectedRoute
  const Content = () => {
    const [activeTab, setActiveTab] = useState("url");
    const [estimates, setEstimates] = useState<Estimate[]>([
      // Sample estimate data for demonstration - only shown to logged-in users
      !isGuestMode ? {
        id: "1",
        makeModel: "Toyota Camry",
        year: 2019,
        mileage: 35000,
        condition: "Excellent",
        estimatedPrice: 18500,
        createdAt: new Date(),
        isScraped: true
      } : null
    ].filter(Boolean) as Estimate[]);

    const handleNewEstimate = (estimate: Estimate) => {
      if (isGuestMode) {
        // In guest mode, only keep the last estimate
        setEstimates([estimate]);
      } else {
        // In logged-in mode, add to history
        setEstimates(prev => [estimate, ...prev]);
      }
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar isGuestMode={isGuestMode} />
        
        <div className="container mx-auto py-6 sm:py-8 px-4">
          {isGuestMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 sm:mb-8">
              <h2 className="text-amber-800 font-medium flex items-center text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Guest Mode
              </h2>
              <p className="text-amber-700 mt-1 text-sm sm:text-base">
                You&apos;re using CarLens as a guest. Your search history won&apos;t be saved.{" "}
                <Link href="/register" className="font-medium underline">
                  Create an account
                </Link>{" "}
                to save your history and access more features.
              </p>
            </div>
          )}
        
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Car Price Estimator</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Estimation Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Get Car Price Estimate</CardTitle>
                  <CardDescription>
                    Enter car details or provide a URL to a car listing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientCarForms 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onNewEstimate={handleNewEstimate}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Estimate History or Current Estimate */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isGuestMode ? "Current Estimate" : "Recent Estimates"}
                  </CardTitle>
                  <CardDescription>
                    {isGuestMode 
                      ? "Your most recent car price estimate" 
                      : "Your saved car price estimates"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EstimateHistory estimates={estimates} />
                </CardContent>
                
                {isGuestMode && (
                  <CardFooter>
                    <div className="w-full text-center">
                      <p className="text-sm text-slate-500 mb-2">Want to save your search history?</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Link href="/register" className="w-full sm:w-auto">
                          <Button size="sm" className="w-full">Create Account</Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return isGuestMode ? <Content /> : <ProtectedRoute><Content /></ProtectedRoute>;
}