import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(8,145,178,0.1)_0%,transparent_50%)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          {/* Logo and Header */}
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
          </div>

          {/* Success Message */}
          <Card className="border-border/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription className="text-center">
                We've sent you a confirmation link to verify your account
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Check your inbox and spam folder</span>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Click the confirmation link in the email to activate your account and start learning with Learnware.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90">
                  <Link href="/auth/login">Continue to Sign In</Link>
                </Button>

                <Button variant="outline" asChild className="w-full h-12 bg-transparent">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
