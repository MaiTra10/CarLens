"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Estimate } from "@/app/dashboard/page";
import CarLoadingAnimation from "@/components/animations/car-loading-animation";

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

  const calculatePercentage = (mileage: number) => {
    const k = 0.00001; // Adjust this value to control the decay rate
    if (mileage <= 10000) {
      return 100; // 100% for mileage 10,000 or less
    }
    return 100 * Math.exp(-k * (mileage - 100000)); // Logarithmic decay for mileage above 10,000
  };

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
      const response = await fetch("http://34.209.36.178:8080/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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

      {isLoading && <CarLoadingAnimation />}
      
      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-slate-50">
          <p className="font-light text-slate-500">
            <span>Analysis Date:</span>{" "}
            {result.createdAt.toLocaleString()}
          </p>
          <a className="font-medium text-lg mb-2" href={result.source}>
            <span className="font-semibold">Vehicle:</span> {result.makeModel}{" "}
          </a>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Vehicle:</span> {result.makeModel}{" "}
              ({result.year})
            </p>
            <p>
              <span className="font-semibold">Mileage:</span>{" "}
              {result.mileage.toLocaleString()} miles
            </p>
            {result.condition && result.condition !== "unknown" && (
              <p>
                <span className="font-semibold">Condition:</span>{" "}
                {result.condition.charAt(0).toUpperCase() + result.condition.slice(1)}
              </p>
            )}
            {result.transmission && result.transmission !== "unknown" && (
              <p>
                <span className="font-semibold">Transmission:</span>{" "}
                {result.transmission.charAt(0).toUpperCase() + result.transmission.slice(1)}
              </p>
            )}
            {result.drivetrain && result.drivetrain !== "unknown" && (
              <p>
                <span className="font-semibold">Drivetrain:</span>{" "}
                {result.drivetrain.toUpperCase()}
              </p>
            )}
            <p>
              <span className="font-semibold">Estimated Price:</span>{" "}
              <span className="text-xl font-bold text-green-600">
                ${result.estimatedPrice.toLocaleString()} CAD
              </span>
            </p>
            <p>
              <span className="font-semibold">Summary:</span>{" "}
              {result.listingSummary}
            </p>
            <iframe
              className="rounded-lg shadow-2xs border-1 border-gray-300 p-2"
              src={result.source} width="100%" height="400"></iframe>

            <hr />
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {result.descr}
            </p>

            <p>
              <span className="font-semibold">Transmission:</span>{" "}
              {result.transmission}
            </p>
            <p>
              <span className="font-semibold">Drivetrain:</span>{" "}
              {result.drivetrain}
            </p>
            <p>
              <span className="font-semibold">Specifications:</span>{" "}
              {result.specifications}
            </p>
            <div>
              <p>
                <span className="font-semibold">Mileage:</span> {result.mileage.toLocaleString()} miles
              </p>
              <div className="w-full h-2 bg-gray-200 mt-2 rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(calculatePercentage(result.mileage), 100)}%`,
                    backgroundColor: 'green',
                  }}
                ></div>
              </div>
            </div>
            <p>
              <span className="font-semibold">Condition:</span>{" "}
              {result.condition.toLocaleString()}
            </p>

            <hr />
            <p>
              <span className="font-semibold">Seller Type:</span>{" "}
              {result.dealer}
            </p>
            <p>
              <span className="font-semibold">Dealer Rating:</span>{" "}
              {result.dealerRating}
            </p>
            <p>
              <span className="font-semibold">Listing Date:</span>{" "}
              {result.creationDate}
            </p>
            <p>
              <span className="font-semibold">Free Carfax?:</span>{" "}
              {result.freeCarfax}
            </p>
            <p>
              <span className="font-semibold">VIN:</span>{" "}
              {result.vin}
            </p>
            <p>
              <span className="font-semibold">Insurance Status:</span>{" "}
              {result.insuranceStatus}
            </p>
            <p>
              <span className="font-semibold">Recall Information:</span>{" "}
              {result.recallInformation}
            </p>
            <p className="text-sm text-slate-500">
              Based on data scraped from the provided URL. High confidence estimate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}