"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { CourseForm } from '@/components/course/CourseForm';
import { Course } from '@/services/DataService';
import { apiService } from '@/services/ApiServiceAdapter';
import { geminiService } from '@/services/GeminiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CourseCard from '@/components/CourseCard';
import { useRouter, usePathname } from 'next/navigation';

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

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        // The adapter handles initialization if needed
        const fetchedCourses = await apiService.getUserCourses();
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

  useEffect(() => {
    if (pathname === '/courses/new') {
      setIsDialogOpen(true);
    }
  }, [pathname]);

  const handleCreateCourse = async (formData: { topic: string, description?: string }) => {
    try {
      setIsCreating(true);

      // 1. Generate with AI
      const generatedContent = await geminiService.generateCourseContent(formData.topic, formData.description);

      // 2. Store in Supabase
      const course = await apiService.createCourse({
        name: generatedContent.courseTitle,
        description: generatedContent.courseDescription,
        topic: formData.topic,
        difficulty: "Beginner", // or from AI
        content: generatedContent,  // save full JSON
      });

      setCourses(prev => [...prev, course]);
      setIsDialogOpen(false);
      
      if (pathname === '/courses/new') {
        router.push('/courses');
      }
      
      toast({
        title: 'Success',
        description: 'Course created successfully with AI!',
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: 'Failed to create course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

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

  const filteredCourses = courses.filter(course =>
    (course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                <DialogTitle>Create New Course with AI</DialogTitle>
              </DialogHeader>
              <CourseForm
                onSubmit={(values) => handleCreateCourse({ topic: values.name, description: values.description })}
                isSubmitting={isCreating}
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
                <CourseCard course={course} />
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

        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found. Create your first course to get started!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Courses;
