"use client"

import { useState, useEffect } from "react"
import MainLayout from "../src/layouts/MainLayout"
import { apiService } from "../src/services/ApiServiceAdapter"
import type { Course } from "../src/services/DataService"
import { Button } from "../src/components/ui/button"
import { Card } from "../src/components/ui/card"
import { useRouter } from "next/navigation"
import CourseCard from "../src/components/CourseCard"
import {
  BookOpen,
  Brain,
  PlusCircle,
  ArrowRight,
  GraduationCap,
  LightbulbIcon,
  Book,
  PenLine,
  Search,
  Award,
  Zap,
  Check,
  ScrollText,
} from "lucide-react"
import { useToast } from "../src/components/ui/use-toast"
import { Badge } from "../src/components/ui/badge"
import { useAuth } from "../src/contexts/AuthContext"
import { geminiService } from "../src/services/GeminiService"

const IndexContent = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalMaterials: 0,
    totalQuizzes: 0,
    averageProgress: 0,
  })
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const setApiKey = async () => {
      await geminiService.saveApiKey("AIzaSyBYmuV-QXvXOknEiKKxp0zscflDtuJK5h4");
    };
    setApiKey();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return // Wait for auth to load

      try {
        setIsLoading(true)
        await apiService.initialize()

        if (user) {
          const fetchedCourses = await apiService.getCourses()
          setCourses(fetchedCourses)

          const completed = fetchedCourses.filter((c) => c.progress === 100).length
          const totalMaterials = fetchedCourses.reduce((acc, course) => acc + (course.studyMaterials?.length || 0), 0)
          const totalQuizzes = fetchedCourses.reduce((acc, course) => acc + (course.quizzes?.length || 0), 0)
          const avgProgress =
            fetchedCourses.length > 0
              ? fetchedCourses.reduce((acc, c) => acc + c.progress, 0) / fetchedCourses.length
              : 0

          setStats({
            totalCourses: fetchedCourses.length,
            completedCourses: completed,
            totalMaterials,
            totalQuizzes,
            averageProgress: Math.round(avgProgress),
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast, user, authLoading])

  const recentCourses = [...courses].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3)

  if (!user && !authLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold">Learnware Grove</h1>
              <Badge variant="outline">Beta</Badge>
            </div>
            <p className="text-xl text-muted-foreground mb-8">Study faster. Understand deeper.</p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/auth/signup")}>
                Get Started
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/auth/login")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Learnware Grove</h1>
              <Badge variant="outline">Beta</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Study faster. Understand deeper.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/courses/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Course
            </Button>
            <Button variant="outline" onClick={() => router.push("/notes/new")}>
              <PenLine className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {isLoading || authLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <div className="text-sm text-muted-foreground">Total Courses</div>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completedCourses}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ScrollText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalMaterials}</div>
                  <div className="text-sm text-muted-foreground">Study Materials</div>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Quizzes</div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Recent Courses</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/courses")}>
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {recentCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {recentCourses.map((course) => (
                        <CourseCard key={course.id} course={course} compact={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No courses found. Create your first course to get started!</p>
                      <Button className="mt-4" onClick={() => router.push("/courses/new")}>
                        Create a Course
                      </Button>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Ready-to-Use AI Features</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <LightbulbIcon className="h-8 w-8 text-yellow-500 mb-2" />
                      <h3 className="font-medium mb-1">Dynamic Content Generation</h3>
                      <p className="text-sm text-muted-foreground">
                        Create course materials and study guides using pre-configured Gemini AI integration
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <Brain className="h-8 w-8 text-purple-500 mb-2" />
                      <h3 className="font-medium mb-1">Research Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        Get answers for complex topics with Google's Gemini API ready out of the box
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <Search className="h-8 w-8 text-blue-500 mb-2" />
                      <h3 className="font-medium mb-1">Web Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Supplement your learning with relevant web resources automatically gathered for you
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <Award className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="font-medium mb-1">Progress Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Track your learning progress with visual indicators and completion metrics
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Getting Started</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium">1</span>
                      </div>
                      <p className="text-sm">Create a new course to begin your learning journey</p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium">2</span>
                      </div>
                      <p className="text-sm">Generate AI-powered content for comprehensive learning</p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium">3</span>
                      </div>
                      <p className="text-sm">Create study materials and quizzes to test your knowledge</p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium">4</span>
                      </div>
                      <p className="text-sm">Track your progress and continue your learning journey</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button className="w-full" onClick={() => router.push("/courses/new")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Start Your First Course
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default function Home() {
  return <IndexContent />
}
