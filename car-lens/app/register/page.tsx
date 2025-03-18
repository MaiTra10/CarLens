// app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import AnimatedLogo from "@/components/logos/animated-logo";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string>("");

  // Validate email using the same regex as the backend
  const validateEmail = (email: string) => {
    const regex = /^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  // Validate password using the same rules as the backend
  const validatePassword = (password: string) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPasswordErrors([]);

    // Check email validity
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Check password requirements
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setPasswordErrors(pwdErrors);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      // Updated URL to match your backend endpoint
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Registration failed");
      }

      // Registration successful
      setIsLoading(false);
      router.push("/login?registered=true");
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="text-center mb-4">
            <Link href="/" className="inline-block">
              <AnimatedLogo />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your CarLens account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="mb-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value && !validateEmail(e.target.value)) {
                    setEmailError("Please enter a valid email address");
                  } else {
                    setEmailError("");
                  }
                }}
                required
                className={`h-11 ${emailError ? "border-red-500" : ""}`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) {
                    setPasswordErrors(validatePassword(e.target.value));
                  } else {
                    setPasswordErrors([]);
                  }
                }}
                required
                className={`h-11 ${
                  passwordErrors.length > 0 ? "border-red-500" : ""
                }`}
              />
              {passwordErrors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  <ul className="list-disc pl-5">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setAcceptTerms(checked as boolean)
                }
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the{" "}
                <Link href="/terms" className="text-blue-500 hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-5 pt-2">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm pt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
