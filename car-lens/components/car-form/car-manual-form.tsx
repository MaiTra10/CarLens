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

// Generate a random ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 9);

export interface CarManualFormProps {
  onSuccess: (estimate: Estimate) => void;
}

export function CarManualForm({ onSuccess }: CarManualFormProps) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    mileage: "",
    condition: "good",
    features: "",
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

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate a mock price based on inputs
      // In a real app, this would come from your DeepSeek AI integration
      const year = parseInt(formData.year);
      const mileage = parseInt(formData.mileage);
      const currentYear = new Date().getFullYear();
      
      // Very simple mock algorithm for demo purposes
      const basePrice = 30000;
      const yearFactor = (currentYear - year) * 1000;
      const mileageFactor = mileage * 0.05;
      const conditionFactor = 
        formData.condition === "excellent" ? 2000 :
        formData.condition === "good" ? 0 :
        formData.condition === "fair" ? -2000 : -4000;
      
      const mockPrice = Math.max(5000, basePrice - yearFactor - mileageFactor + conditionFactor);

      const mockEstimate: Estimate = {
        id: generateId(),
        makeModel: `${formData.make} ${formData.model}`,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        condition: formData.condition,
        features: formData.features,
        estimatedPrice: Math.round(mockPrice),
        createdAt: new Date(),
        isScraped: false
      };

      setResult(mockEstimate);
      onSuccess(mockEstimate);
    } catch (err) {
      // Use type assertion with unknown as a safer alternative to any
      const error = err as Error;
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

        <Button type="submit" disabled={isLoading} className="w-full">
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
              <span className="font-semibold">Vehicle:</span> {result.makeModel} ({result.year})
            </p>
            <p>
              <span className="font-semibold">Mileage:</span> {result.mileage.toLocaleString()} miles
            </p>
            <p>
              <span className="font-semibold">Condition:</span>{" "}
              {result.condition 
                ? result.condition.charAt(0).toUpperCase() + result.condition.slice(1)
                : "Not specified"}
            </p>
            <p>
              <span className="font-semibold">Estimated Price:</span>{" "}
              <span className="text-xl font-bold text-green-600">
                ${result.estimatedPrice.toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Based on manually entered data. Medium confidence estimate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}