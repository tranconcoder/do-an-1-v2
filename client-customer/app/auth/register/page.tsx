"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginFailure } from '@/lib/store/slices/userSlice'; // loginSuccess not needed here directly
import { AppDispatch, RootState } from '@/lib/store/store'; 

import authService, { RegisterPayload, AuthResponse } from "@/lib/services/api/authService"

export default function RegisterPage() {
  const router = useRouter() // Can be used for redirecting after successful registration if desired
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: reduxIsLoading, error: reduxError } = useSelector((state: RootState) => state.user);

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sign Up state
  const [signUpFullName, setSignUpFullName] = useState("")
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(loginStart()); 
    setSuccessMessage(null);
    dispatch(loginFailure('')); // Clear previous errors

    if (signUpPassword !== signUpConfirmPassword) {
      dispatch(loginFailure("Passwords do not match."));
      return
    }

    const payload: RegisterPayload = {
      user_fullName: signUpFullName,
      phoneNumber: signUpPhoneNumber,
      user_email: signUpEmail,
      password: signUpPassword,
    }

    try {
      const response: AuthResponse = await authService.register(payload)
      console.log("Registration successful:", response)
      setSuccessMessage("Registration successful! Please sign in.")
      setSignUpFullName("")
      setSignUpPhoneNumber("")
      setSignUpEmail("")
      setSignUpPassword("")
      setSignUpConfirmPassword("")
      // Optionally redirect to login page
      // setTimeout(() => router.push("/auth/login"), 2000); 
    } catch (err: any) {
      console.error("Registration error:", err)
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during registration."
      dispatch(loginFailure(errorMessage));
    }
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">Enter your information to create an account</p>
      </div>

      {reduxError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{reduxError}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" /> 
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleRegister} className="space-y-6 pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="John Doe"
                required
                value={signUpFullName}
                onChange={(e) => setSignUpFullName(e.target.value)}
                disabled={reduxIsLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number-signup">Phone Number</Label>
              <Input
                id="phone-number-signup"
                type="tel"
                placeholder="0123456789"
                required
                value={signUpPhoneNumber}
                onChange={(e) => setSignUpPhoneNumber(e.target.value)}
                disabled={reduxIsLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              type="email"
              placeholder="m@example.com"
              required
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              disabled={reduxIsLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <div className="relative">
              <Input
                id="password-signup"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                disabled={reduxIsLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                disabled={reduxIsLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
                <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center justify-center"
            disabled={reduxIsLoading}
          >
            {reduxIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </div>
      </form>
    </>
  )
} 