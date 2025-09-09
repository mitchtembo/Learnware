"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import MainLayout from '@/layouts/MainLayout';
import CourseForm from '@/components/course/CourseForm';
import { Course, CourseContent } from '@/services/DataService';
import { apiService } from '@/services/ApiServiceAdapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CourseCard from '@/components/CourseCard';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

const courseSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  difficulty: z.string().min(3, "Difficulty must be at least 3 characters"),
  description: z.string().optional(),
  overview: z.string().min(10, "Overview is required"),
  learning_objectives: z.array(z.object({ value: z.string().min(3, "Objective cannot be empty") })),
  key_topics: z.array(z.object({
    title: z.string().min(3, "Topic title cannot be empty"),
    description: z.string().min(10, "Topic description cannot be empty")
  })),
  prerequisites: z.array(z.object({ value: z.string().min(3, "Prerequisite cannot be empty") })),
});

type CourseFormData = z.infer<typeof courseSchema>;

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // derive an active course id from the pathname when the route is /courses/:id
  const activeCourseId = (() => {
    if (!pathname) return null;
    const parts = pathname.split('/').filter(Boolean);
    // parts[0] === 'courses', parts[1] === id
    if (parts.length === 2 && parts[0] === 'courses') return parts[1];
    return null;
  })();

  const closeCourseModal = () => {
    // navigate back to /courses when closing modal
    router.push('/courses');
  };

  const CourseDetailsContent = ({ courseId }: { courseId: string }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [loadingCourse, setLoadingCourse] = useState(true);

    useEffect(() => {
      const fetch = async () => {
        try {
          setLoadingCourse(true);
          const c = await apiService.getCourseById(courseId);
          setCourse(c as Course | null);
        } catch (err) {
          console.error('Failed to load course details', err);
        } finally {
          setLoadingCourse(false);
        }
      };
      fetch();
    }, [courseId]);

    if (loadingCourse) return <div className="p-6">Loading...</div>;
    if (!course) return <div className="p-6">Course not found.</div>;

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">{course.name}</h2>
        {course.topic && <p className="text-sm text-muted-foreground">{course.topic}</p>}
        <div className="mt-4 prose max-w-none">{course.content?.overview || course.description}</div>
      </div>
    );
  };

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      topic: "",
      difficulty: "Beginner",
      description: "",
      overview: "",
      learning_objectives: [],
      key_topics: [],
      prerequisites: [],
    },
  });

  useEffect(() => {
    // Initialize API service and load courses
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await apiService.initialize();
        const fetchedCourses = await apiService.getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load courses. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  // Check if the route is /courses/new and open the dialog
  useEffect(() => {
    if (pathname === '/courses/new') {
      setIsDialogOpen(true);
    }
  }, [pathname]);

  const handleSubmit = async (data: CourseFormData) => {
    setIsCreating(true);
    try {
      const courseData: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
        name: data.name,
        topic: data.topic,
        difficulty: data.difficulty,
        description: data.description,
      };
      const content: CourseContent = {
        overview: data.overview,
        learning_objectives: data.learning_objectives.map(o => o.value),
        key_topics: data.key_topics,
        prerequisites: data.prerequisites.map(p => p.value),
      };

      const newCourse = await apiService.createCourse({ ...courseData, content });
      setCourses(prev => [...prev, newCourse]);
      setIsDialogOpen(false);
      form.reset();
      
      // Navigate to the courses page if we were on /courses/new
      if (pathname === '/courses/new') {
        router.push('/courses');
      }
      
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: `Failed to create course: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle dialog close to redirect if on /courses/new
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && pathname === '/courses/new') {
      router.push('/courses');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setIsDeleting(courseId);
        const success = await apiService.deleteCourse(courseId);
        if (success) {
          setCourses(prev => prev.filter(course => course.id !== courseId));
          toast({
            title: 'Success',
            description: 'Course deleted successfully',
          });
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete course. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredCourses = courses
    .filter(course =>
      (course.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <ProtectedRoute>
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
              <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <CourseForm
                  form={form}
                  onSubmit={handleSubmit}
                  onGenerate={() => {}}
                  isLoading={isCreating}
                  isGenerating={false}
                />
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
                  <CourseCard
                    course={course}
                    onClick={() => router.push(`/courses/${course.id}`)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
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

          {/* Course details modal tied to route /courses/:id */}
          <Dialog open={!!activeCourseId} onOpenChange={(open) => { if (!open) closeCourseModal(); }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Course Details</DialogTitle>
              </DialogHeader>
              {activeCourseId && <CourseDetailsContent courseId={activeCourseId} />}
            </DialogContent>
          </Dialog>

          {!isLoading && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No courses found. Create your first course to get started!</p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Courses;
