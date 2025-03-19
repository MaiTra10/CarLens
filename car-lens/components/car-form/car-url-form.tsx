"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Estimate } from "@/app/dashboard/page";

// Generate a random ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 9);

export interface CarUrlFormProps {
  onSuccess: (estimate: Estimate) => void;
}

export function CarUrlForm({ onSuccess }: CarUrlFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Estimate | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // Basic URL validation
      if (!url.trim() || !url.startsWith("http")) {
        throw new Error("Please enter a valid URL");
      }

      // Call backend AI service
      const response = await fetch("http://localhost:8080/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process URL");
      }

      const aiResponse = await response.json();

      // Log the raw response for debugging
      console.log("Raw response:", aiResponse);
      console.log("Response type:", typeof aiResponse);

      const estimate: Estimate = {
        id: generateId(),
        makeModel: aiResponse.title || "Unknown Vehicle",
        year: parseInt(
          aiResponse.title?.match(/\d{4}/)?.[0] ||
          new Date().getFullYear().toString()
        ),
        mileage: parseInt(aiResponse.odometer?.replace(/[^\d]/g, "") || "0"),
        condition: aiResponse.condition || "unknown",
        estimatedPrice: parseInt(
          aiResponse.price?.replace(/[^\d]/g, "") || "0"
        ),
        createdAt: new Date(),
        isScraped: true,
        source: aiResponse.source || url,
        dealer: aiResponse.dealer,
        dealerRating: aiResponse.dealer_rating,
        transmission: aiResponse.transmission,
        drivetrain: aiResponse.drivetrain,
        descr: aiResponse.descr,
        specifications: aiResponse.specifications,
        creationDate: aiResponse.creation_date,
        freeCarfax: aiResponse.free_carfax,
        vin: aiResponse.vin,
        insuranceStatus: aiResponse.insurance_status,
        recallInformation: aiResponse.recall_information,
        listingSummary: aiResponse.listing_summary,
      };

      setResult(estimate);
      onSuccess(estimate);
    } catch (err) {
      const error = err as Error;
      console.error("Full error:", err);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="car-url">Car Listing URL</Label>
          <Input
            id="car-url"
            type="url"
            placeholder="https://example.com/car-listing"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <p className="text-sm text-slate-500">
            Paste a URL to a car listing from a supported website
          </p>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full hover:cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Get Estimate"
          )}
        </Button>
      </form>
      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-slate-50">
          <h3 className="font-medium text-lg mb-2">Price Estimate</h3>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Vehicle:</span> {result.makeModel}{" "}
              ({result.year})
            </p>
            <p>
              <span className="font-semibold">Mileage:</span>{" "}
              {result.mileage.toLocaleString()} miles
            </p>
            <p>
              <span className="font-semibold">Estimated Price:</span>{" "}
              <span className="text-xl font-bold text-green-600">
                ${result.estimatedPrice.toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Based on data scraped from the provided URL. High confidence
              estimate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
