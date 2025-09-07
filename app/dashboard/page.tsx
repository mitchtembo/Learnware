import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { BookOpen, Brain, Users, TrendingUp, LogOut } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/learnware-logo.jpeg"
              alt="Learnware Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold text-foreground">Learnware</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {data.user.user_metadata?.full_name || data.user.email}
            </span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Welcome to Your AI Study Dashboard</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your personalized learning journey starts here. Explore courses, track progress, and enhance your skills
              with AI-powered assistance.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">My Courses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">0</div>
                <CardDescription>Enrolled courses</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent" />
                  <CardTitle className="text-lg">AI Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">0</div>
                <CardDescription>Study sessions completed</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">0%</div>
                <CardDescription>Overall completion</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <CardTitle className="text-lg">Community</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">0</div>
                <CardDescription>Study groups joined</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-12 bg-primary hover:bg-primary/90">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
                <Button variant="outline" className="h-12 bg-transparent">
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Session
                </Button>
                <Button variant="outline" className="h-12 bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Join Study Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
