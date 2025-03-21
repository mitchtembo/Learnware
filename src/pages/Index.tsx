import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/ApiService';
import { Course } from '../services/DataService';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useNavigate, Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { 
  BookOpen, 
  FileText, 
  Brain, 
  PlusCircle,
  ArrowRight,
  GraduationCap,
  LightbulbIcon,
  Book,
  PenLine,
  Search,
  Sparkles,
  Layers,
  Clock,
  Users,
  Award,
  BarChart,
  Zap,
  Check,
  Lock,
  AlarmClock,
  ScrollText
} from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { Badge } from '../components/ui/badge';

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalMaterials: 0,
    totalQuizzes: 0,
    averageProgress: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await apiService.initialize();
        const fetchedCourses = await apiService.getCourses();
        setCourses(fetchedCourses);

        // Calculate stats
        const completed = fetchedCourses.filter(c => c.progress === 100).length;
        const totalMaterials = fetchedCourses.reduce((acc, course) => 
          acc + (course.studyMaterials?.length || 0), 0);
        const totalQuizzes = fetchedCourses.reduce((acc, course) => 
          acc + (course.quizzes?.length || 0), 0);
        const avgProgress = fetchedCourses.length > 0
          ? fetchedCourses.reduce((acc, c) => acc + c.progress, 0) / fetchedCourses.length
          : 0;

        setStats({
          totalCourses: fetchedCourses.length,
          completedCourses: completed,
          totalMaterials,
          totalQuizzes,
          averageProgress: Math.round(avgProgress)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const recentCourses = [...courses]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Learnware Grove</h1>
            <p className="text-muted-foreground mt-1">
              Ready-to-use AI-powered learning platform with Gemini integration
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/courses/new')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Course
            </Button>
            <Button variant="outline" onClick={() => navigate('/notes/new')}>
              <PenLine className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
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
              {/* Main Content - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Courses */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Recent Courses</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {recentCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {recentCourses.map(course => (
                        <CourseCard key={course.id} course={course} compact={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No courses found. Create your first course to get started!</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/courses/new')}
                      >
                        Create a Course
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Highlighted Features */}
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

              {/* Sidebar - 1/3 width */}
              <div className="space-y-6">
                {/* Quick Start Guide */}
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
                    <Button className="w-full" onClick={() => navigate('/courses/new')}>
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
  );
};

export default Index;
