"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(8,145,178,0.1)_0%,transparent_50%)]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="border-border/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>We've sent a password reset link to your email address</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(8,145,178,0.1)_0%,transparent_50%)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/learnware-logo.jpeg"
                alt="Learnware Logo"
                width={80}
                height={80}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-2">Enter your email to receive a reset link</p>
            </div>
          </div>

          <Card className="border-border/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
              <CardDescription className="text-center">We'll send you a link to reset your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-border/50 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
