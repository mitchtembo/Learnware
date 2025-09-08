"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Course } from "@/services/DataService"
import { getCourseById } from "@/services/DataService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpenCheck, Layers, Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { generateCourseContent } from "@/services/GeminiService"

const CourseDetailsPage = () => {
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseId = params.id as string
        const fetchedCourse = await getCourseById(courseId)
        setCourse(fetchedCourse)
      } catch (error) {
        console.error("Failed to fetch course:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCourse()
    }
  }, [params.id])

  const handleGenerateContent = async () => {
    if (!course) return
    setGenerating(true)
    try {
      const updatedCourse = await generateCourseContent(course)
      setCourse(updatedCourse)
    } catch (error) {
      console.error("Failed to generate course content:", error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/courses" className="flex items-center text-sm text-muted-foreground mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to courses
      </Link>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{course.name}</CardTitle>
                {course.topic && <p className="text-muted-foreground">{course.topic}</p>}
              </div>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} />
            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(course.created_at!).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>{course.study_materials?.length || 0} materials</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4" />
                <span>{course.quizzes?.length || 0} quizzes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {course.study_plan ? (
              <div className="prose max-w-none">{course.study_plan}</div>
            ) : (
              <p>No study plan available. Generate one to get started!</p>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={handleGenerateContent} disabled={generating}>
            {generating ? "Generating..." : "Generate Course Content"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Study Materials</CardTitle>
          </CardHeader>
          <CardContent>
            {course.study_materials && course.study_materials.length > 0 ? (
              <ul className="space-y-2">
                {course.study_materials.map((material, index) => (
                  <li key={index} className="p-2 border rounded-md">{material.title}</li>
                ))}
              </ul>
            ) : (
              <p>No study materials yet. Generate them to start learning!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {course.quizzes && course.quizzes.length > 0 ? (
              <ul className="space-y-2">
                {course.quizzes.map((quiz, index) => (
                  <li key={index} className="p-2 border rounded-md">{quiz.title}</li>
                ))}
              </ul>
            ) : (
              <p>No quizzes available. Generate some to test your knowledge!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CourseDetailsPage
