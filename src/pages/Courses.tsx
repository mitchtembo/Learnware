"use client"

import { useState, useEffect } from "react"
import MainLayout from "../layouts/MainLayout"
import { CourseForm } from "../components/course/CourseForm"
import type { Course } from "../services/DataService"
import { apiService } from "../services/ApiServiceAdapter"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Search, Plus, Trash2, Loader2 } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "../components/ui/use-toast"
import CourseCard from "../components/CourseCard"
import { useAuth } from "../contexts/AuthContext"

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const initializeData = async () => {
      if (authLoading) return // Wait for auth to load
      if (!user) {
        navigate("/auth/login")
        return
      }

      try {
        setIsLoading(true)
        await apiService.initialize()
        const fetchedCourses = await apiService.getCourses()
        setCourses(fetchedCourses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [toast, user, authLoading, navigate])

  useEffect(() => {
    if (location.pathname === "/courses/new") {
      setIsDialogOpen(true)
    }
  }, [location.pathname])

  const handleCreateCourse = async (
    courseData: Omit<Course, "id" | "progress" | "studentsEnrolled" | "createdAt" | "updatedAt">,
  ) => {
    try {
      setIsCreating(true)
      const newCourse = await apiService.createCourse(courseData)
      setCourses((prev) => [...prev, newCourse])
      setIsDialogOpen(false)

      if (location.pathname === "/courses/new") {
        navigate("/courses")
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      })
    } catch (error) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open && location.pathname === "/courses/new") {
      navigate("/courses")
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        setIsDeleting(courseId)
        const success = await apiService.deleteCourse(courseId)
        if (success) {
          setCourses((prev) => prev.filter((course) => course.id !== courseId))
          toast({
            title: "Success",
            description: "Course deleted successfully",
          })
        }
      } catch (error) {
        console.error("Error deleting course:", error)
        toast({
          title: "Error",
          description: "Failed to delete course. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Courses</h1>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <CourseForm onSubmit={handleCreateCourse} isSubmitting={isCreating} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="relative group">
                <CourseCard course={course} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCourse(course.id)
                  }}
                  disabled={isDeleting === course.id}
                >
                  {isDeleting === course.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found. Create your first course to get started!</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Courses
