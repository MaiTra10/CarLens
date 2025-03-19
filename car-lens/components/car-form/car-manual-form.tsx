"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Estimate } from "@/app/dashboard/page";
import CarLoadingAnimation from "@/components/animations/car-loading-animation";

// Generate a random ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 9);

export interface ManualCarFormProps {
  onSuccess: (estimate: Estimate) => void;
}

export function ManualCarForm({ onSuccess }: ManualCarFormProps) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    mileage: "",
    condition: "good",
    features: "",
    transmission: "unspecified",
    drivetrain: "unspecified",
    vin: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Estimate | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // Validate input
      if (!formData.make || !formData.model || !formData.mileage) {
        throw new Error("Please fill out all required fields");
      }

      // Prepare data to send to the AI service
      const carDescription = `I need a detailed pricing and specification analysis for this vehicle:

Make: ${formData.make}
Model: ${formData.model}
Year: ${formData.year}
Mileage: ${formData.mileage} miles
Condition: ${formData.condition}${formData.transmission !== "unspecified" ? '\nTransmission: ' + formData.transmission : ''}${formData.drivetrain !== "unspecified" ? '\nDrivetrain: ' + formData.drivetrain : ''}${formData.vin ? '\nVIN: ' + formData.vin : ''}${formData.features ? '\nFeatures: ' + formData.features : ''}

Provide me with a market value assessment in your response including a specific price estimate in Canadian dollars (CAD) for this vehicle based on current market data. Include details about typical pricing for this make/model in this condition with similar mileage. Be as specific as possible with your price estimate.

IMPORTANT: Format your response as a valid JSON object with the following structure:
{
  "source": "manual entry",
  "title": "<year make model>",
  "price": "<numeric price, CAD>",
  "dealer": "unknown",
  "dealer_rating": "unknown",
  "odometer": "<mileage> miles",
  "transmission": "<transmission type>",
  "drivetrain": "<drivetrain type>",
  "descr": "<description based on features>",
  "specifications": "<any specifications you can determine>",
  "condition": "<condition>",
  "listing_summary": "<brief summary of the vehicle and your price assessment>"
}

Only respond with a properly formatted JSON object and nothing else.`;
      
      // Call backend AI service
      const response = await fetch("http://localhost:8080/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          message: carDescription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || "Failed to process vehicle data");
      }

      let aiResponse;
      try {
        aiResponse = await response.json();
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        console.log("Raw response text:", await response.text().catch(() => "Unable to get response text"));
        
        // Create a fallback response
        aiResponse = {
          source: "manual entry",
          title: `${formData.year} ${formData.make} ${formData.model}`,
          price: calculateFallbackPrice().toString(),
          condition: formData.condition,
          transmission: formData.transmission !== "unspecified" ? formData.transmission : "unknown",
          drivetrain: formData.drivetrain !== "unspecified" ? formData.drivetrain : "unknown",
          odometer: `${formData.mileage} miles`,
          descr: formData.features || "No description available",
          vin: formData.vin || "unknown",
          listing_summary: `Manual entry for ${formData.year} ${formData.make} ${formData.model} with ${formData.mileage} miles in ${formData.condition} condition.`
        };
      }

      // Log the raw response for debugging
      console.log("Raw response:", aiResponse);
      console.log("Response type:", typeof aiResponse);
      
      // If AI doesn't return a usable price estimate, calculate one
      if (!aiResponse.price || aiResponse.price === "unknown" || isNaN(parseInt(aiResponse.price))) {
        const calculatedPrice = calculateFallbackPrice();
        aiResponse.price = calculatedPrice.toString();
        console.log("Using fallback price calculation:", calculatedPrice);
      }
      
      // Create estimate object from AI response or fall back to calculated values
      const estimate: Estimate = {
        id: generateId(),
        makeModel: `${formData.make} ${formData.model}`,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        condition: formData.condition,
        // Parse price from AI response or use fallback
        estimatedPrice: parseAIPrice(aiResponse.price),
        createdAt: new Date(),
        isScraped: false,
        // Only include fields that were explicitly entered by the user
        source: "manual entry",
        transmission: formData.transmission !== "unspecified" ? formData.transmission : undefined,
        drivetrain: formData.drivetrain !== "unspecified" ? formData.drivetrain : undefined,
        descr: formData.features || undefined,
        vin: formData.vin || undefined,
        // Keep other fields from AI response
        specifications: aiResponse.specifications,
        insuranceStatus: aiResponse.insurance_status,
        recallInformation: aiResponse.recall_information,
        listingSummary: aiResponse.listing_summary
      };
      
      // Function to parse price from AI response
      function parseAIPrice(priceStr: string | undefined): number {
        // If price is undefined, empty, or "unknown", use fallback calculation
        if (!priceStr || priceStr === "" || priceStr === "unknown") {
          return calculateFallbackPrice();
        }
        
        try {
          // Remove all non-numeric characters except for decimal points
          const numericPrice = priceStr.replace(/[^0-9.]/g, "");
          const parsedPrice = parseInt(numericPrice);
          
          // If parsing yields a valid number, return it, otherwise use fallback
          return !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : calculateFallbackPrice();
        } catch (e) {
          console.log("Error parsing price:", e);
          return calculateFallbackPrice();
        }
      }

      setResult(estimate);
      onSuccess(estimate);
    } catch (err) {
      // Use type assertion with unknown as a safer alternative to any
      const error = err as Error;
      console.error("Full error:", err);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback calculation in case AI service doesn't return a price estimate
  const calculateFallbackPrice = () => {
    const year = parseInt(formData.year);
    const mileage = parseInt(formData.mileage);
    const currentYear = new Date().getFullYear();

    // Simple fallback algorithm
    const basePrice = 30000;
    const yearFactor = (currentYear - year) * 1000;
    const mileageFactor = mileage * 0.05;
    const conditionFactor =
      formData.condition === "excellent" ? 2000 :
        formData.condition === "good" ? 0 :
          formData.condition === "fair" ? -2000 : -4000;

    const price = Math.max(5000, basePrice - yearFactor - mileageFactor + conditionFactor);
    return Math.round(price);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              name="make"
              placeholder="e.g., Toyota"
              value={formData.make}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              placeholder="e.g., Camry"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select
              value={formData.year}
              onValueChange={(value) => handleSelectChange("year", value)}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              placeholder="e.g., 45000"
              value={formData.mileage}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => handleSelectChange("condition", value)}
          >
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission (optional)</Label>
            <Select
              value={formData.transmission || "unspecified"}
              onValueChange={(value) => handleSelectChange("transmission", value)}
            >
              <SelectTrigger id="transmission">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">Not specified</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="cvt">CVT</SelectItem>
                <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drivetrain">Drivetrain (optional)</Label>
            <Select
              value={formData.drivetrain || "unspecified"}
              onValueChange={(value) => handleSelectChange("drivetrain", value)}
            >
              <SelectTrigger id="drivetrain">
                <SelectValue placeholder="Select drivetrain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">Not specified</SelectItem>
                <SelectItem value="fwd">FWD</SelectItem>
                <SelectItem value="rwd">RWD</SelectItem>
                <SelectItem value="awd">AWD</SelectItem>
                <SelectItem value="4wd">4WD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vin">VIN (optional)</Label>
          <Input
            id="vin"
            name="vin"
            placeholder="e.g., 1HGCM82633A123456"
            value={formData.vin}
            onChange={handleChange}
          />
          <p className="text-xs text-slate-500">
            Vehicle Identification Number helps with accurate pricing
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="features">Features (optional)</Label>
          <Textarea
            id="features"
            name="features"
            placeholder="List any special features, options, or modifications..."
            value={formData.features}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full hover:cursor-pointer">
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
          <h3 className="font-medium text-lg mb-2">Price Estimate</h3>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Vehicle:</span> {result.makeModel} ({result.year})
            </p>
            <p>
              <span className="font-semibold">Mileage:</span> {result.mileage.toLocaleString()} miles
            </p>
            {result.condition && (
              <p>
                <span className="font-semibold">Condition:</span>{" "}
                {result.condition.charAt(0).toUpperCase() + result.condition.slice(1)}
              </p>
            )}
            {result.transmission && result.transmission !== "unspecified" && result.transmission !== "unknown" && (
              <p>
                <span className="font-semibold">Transmission:</span>{" "}
                {result.transmission.charAt(0).toUpperCase() + result.transmission.slice(1)}
              </p>
            )}
            {result.drivetrain && result.drivetrain !== "unspecified" && result.drivetrain !== "unknown" && (
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
            <p className="text-sm text-slate-500">
              Based on AI analysis of manually entered data. {result.isScraped ? "High" : "Medium"} confidence estimate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}