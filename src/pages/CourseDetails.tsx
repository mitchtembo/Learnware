import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Course, StudyMaterial, Quiz } from '../services/DataService';
import { apiService } from '../services/ApiService';
import { geminiService } from '../services/GeminiService';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  Check,
  FileText,
  GraduationCap,
  ListChecks,
  Clock,
  Users,
  Globe,
  Loader2,
  BarChart4,
  Download,
  Edit,
  Plus,
  Save,
  ArrowRight,
  CheckCircle,
  XCircle,
  Book,
  Code,
  Coffee,
  Terminal,
  BarChart,
  Cpu,
  Shield,
  Briefcase,
  TrendingUp,
  Megaphone,
  Landmark,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Palette,
  Music,
  Languages
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { Progress } from "../components/ui/progress";
import { getCourseBackground } from '../utils/courseBackgrounds';
import ReactMarkdown from 'react-markdown';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '../components/ui/dialog';

// Map of icon names to Lucide icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  "book": Book,
  "book-open": BookOpen,
  "code": Code,
  "code-json": Code,
  "code-2": Code,
  "coffee": Coffee,
  "terminal": Terminal,
  "bar-chart": BarChart,
  "brain": Brain,
  "cpu": Cpu,
  "shield": Shield,
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "megaphone": Megaphone,
  "landmark": Landmark,
  "atom": Atom,
  "flask-conical": FlaskConical,
  "dna": Dna,
  "calculator": Calculator,
  "clock": Clock,
  "palette": Palette,
  "music": Music,
  "languages": Languages
};

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingMaterial, setGeneratingMaterial] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [savingData, setSavingData] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const courseData = await apiService.getCourseById(id);
        if (courseData) {
          setCourse(courseData);
        } else {
          navigate('/courses');
          toast({
            title: "Course not found",
            description: "The requested course could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          title: "Error",
          description: "Failed to load course details.",
          variant: "destructive",
        });
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate, toast]);

  const updateCourseData = async (updatedData: Partial<Course>) => {
    if (!course || !id) return;
    
    try {
      setSavingData(true);
      const updatedCourse = await apiService.updateCourse(id, updatedData);
      setCourse(updatedCourse);
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course data.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSavingData(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!course) return;
    
    setGeneratingContent(true);
    try {
      const content = await geminiService.generateCourseContent(course.name, course.description);
      if (content.error) {
        toast({
          title: "Error",
          description: content.error,
          variant: "destructive",
        });
        return;
      }
      
      await updateCourseData({ content });
      
      toast({
        title: "Success",
        description: "Course content generated successfully",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate course content",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleGenerateStudyMaterial = async () => {
    if (!course) return;
    
    setGeneratingMaterial(true);
    try {
      const studyMaterial = await geminiService.generateStudyMaterial(course.name, course.description);
      if (studyMaterial.error) {
        toast({
          title: "Error",
          description: studyMaterial.error,
          variant: "destructive",
        });
        return;
      }
      
      const updatedMaterials = [...(course.studyMaterials || []), studyMaterial];
      await updateCourseData({ studyMaterials: updatedMaterials });
      
      toast({
        title: "Success",
        description: "Study material generated successfully",
      });
    } catch (error) {
      console.error('Error generating study material:', error);
      toast({
        title: "Error",
        description: "Failed to generate study material",
        variant: "destructive",
      });
    } finally {
      setGeneratingMaterial(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!course) return;
    
    setGeneratingQuiz(true);
    try {
      const quiz = await geminiService.generateQuizQuestions(course.name);
      if (quiz.error) {
        toast({
          title: "Error",
          description: quiz.error,
          variant: "destructive",
        });
        return;
      }
      
      const updatedQuizzes = [...(course.quizzes || []), quiz];
      await updateCourseData({ quizzes: updatedQuizzes });
      
      toast({
        title: "Success",
        description: "Quiz questions generated successfully",
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz questions",
        variant: "destructive",
      });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleUpdateProgress = async (newProgress: number) => {
    if (!course) return;
    
    try {
      await updateCourseData({ progress: newProgress });
      toast({
        title: "Success",
        description: "Progress updated successfully",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const formatText = (text: string) => {
    if (!text) return '';
    
    // Replace **text** with <strong>text</strong> for bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle bullet points (lines starting with * or -)
    formatted = formatted.replace(/^[*\-]\s+(.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/<li>.*?<\/li>(\n|$)+<li>.*?<\/li>/gs, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Handle ordered lists (lines starting with numbers)
    formatted = formatted.replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/<li>.*?<\/li>(\n|$)+<li>.*?<\/li>/gs, (match) => {
      if (match.match(/^\d+\./)) {
        return `<ol>${match}</ol>`;
      }
      return match;
    });
    
    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  const renderCourseContent = () => {
    if (!course || !course.content) return null;
    
    const content = course.content;
    return (
      <div className="space-y-6">
        {content.overview && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Overview</h3>
            <p className="whitespace-pre-line">{content.overview}</p>
          </Card>
        )}
        
        {content.learningObjectives && content.learningObjectives.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Learning Objectives</h3>
            <ul className="space-y-2">
              {content.learningObjectives.map((objective: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        
        {content.keyTopics && content.keyTopics.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Key Topics</h3>
            <div className="space-y-4">
              {content.keyTopics.map((topic: any, index: number) => (
                <div key={index}>
                  <h4 className="font-medium">{topic.title}</h4>
                  <p className="text-gray-600">{topic.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {content.prerequisites && content.prerequisites.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
            <ul className="space-y-2">
              {content.prerequisites.map((prerequisite: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <ListChecks className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{prerequisite}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        
        {content.estimatedTimeHours && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Estimated Time</h3>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>{content.estimatedTimeHours} hours</span>
            </div>
          </Card>
        )}
        
        {/* Fallback for raw content or unexpected format */}
        {!content.overview && !content.learningObjectives && !content.keyTopics && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Course Content</h3>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
              {typeof content === 'string' 
                ? content 
                : JSON.stringify(content, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    );
  };

  const renderStudyMaterials = () => {
    if (!course || !course.studyMaterials || course.studyMaterials.length === 0) {
      return (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold">Generate Study Materials</h3>
            <p className="text-gray-600">
              Generate comprehensive study materials including content explanation,
              key points, and practice questions.
            </p>
            <Button 
              onClick={handleGenerateStudyMaterial} 
              disabled={generatingMaterial || savingData}
              className="w-full"
            >
              {generatingMaterial ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : savingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Generate Materials'
              )}
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <div className="space-y-6">
        {course.studyMaterials.map((material, index) => (
          <div key={index} className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">{material.title || `Study Material ${index + 1}`}</h3>
              {material.content && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Content</h4>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatText(material.content) }}
                  />
                </div>
              )}
              
              {material.summary && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatText(material.summary) }}
                  />
                </div>
              )}
              
              {material.keyPoints && material.keyPoints.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Key Points</h4>
                  <ul className="space-y-1 pl-5 list-disc">
                    {material.keyPoints.map((point, i) => (
                      <li key={i} 
                        className="pl-1"
                        dangerouslySetInnerHTML={{ __html: formatText(point) }}
                      />
                    ))}
                  </ul>
                </div>
              )}
              
              {material.examples && material.examples.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Examples</h4>
                  <div className="space-y-2">
                    {material.examples.map((example, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-md">
                        <code className="block whitespace-pre-wrap">{example}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {material.practiceQuestions && material.practiceQuestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Practice Questions</h4>
                  <div className="space-y-4">
                    {material.practiceQuestions.map((qa, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium">Q: {qa.question}</p>
                        <p className="mt-2">A: {qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!material.content && !material.keyPoints && (
                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(material, null, 2)}
                </pre>
              )}
            </Card>
          </div>
        ))}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateStudyMaterial}
            disabled={generatingMaterial}
          >
            {generatingMaterial ? 'Generating...' : 'Generate More Materials'}
          </Button>
        </div>
      </div>
    );
  };

  const renderQuizzes = () => {
    if (!course || !course.quizzes || course.quizzes.length === 0) {
      return (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold">Generate Quiz</h3>
            <p className="text-gray-600">
              Generate quiz questions to test your knowledge about this course.
            </p>
            <Button 
              onClick={handleGenerateQuiz} 
              disabled={generatingQuiz || savingData}
              className="w-full"
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : savingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <div className="space-y-6">
        {course.quizzes.map((quiz, index) => (
          <Card key={index} className="p-6">
            <h3 className="text-xl font-semibold mb-4">{quiz.topic || `Quiz ${index + 1}`}</h3>
            
            {quiz.questions && quiz.questions.length > 0 ? (
              <div className="space-y-6">
                {quiz.questions.map((q, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                    
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {q.options.map((option, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border 
                              ${option === q.correctAnswer ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                              {option === q.correctAnswer && (
                                <Check className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.correctAnswer && !q.options && (
                      <div className="mb-2">
                        <span className="font-medium">Answer: </span>
                        <span>{q.correctAnswer}</span>
                      </div>
                    )}
                    
                    {q.explanation && (
                      <div className="bg-gray-50 p-3 rounded-md mt-2">
                        <span className="font-medium">Explanation: </span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(quiz, null, 2)}
              </pre>
            )}
          </Card>
        ))}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
          >
            {generatingQuiz ? 'Generating...' : 'Generate More Quizzes'}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header Card */}
        <div className="mb-8 overflow-hidden rounded-lg border shadow-sm">
          {/* Dynamic Header */}
          {(() => {
            const background = getCourseBackground(course.topic || course.name);
            const IconComponent = iconMap[background.icon] || BookOpen;
            
            return (
              <div className={`${background.bgColor} ${background.textColor} p-8`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
                    <p className="opacity-90">{course.code}</p>
                    {course.topic && <p className="text-sm opacity-80 mt-1">{course.topic}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-full">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="bg-white/20 border-0">
                      {course.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Course Details */}
          <div className="p-6">
            <p className="text-muted-foreground mb-6">{course.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {course.startDate.toLocaleDateString()} - {course.endDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Enrolled</p>
                  <p className="text-sm text-gray-500">
                    {course.studentsEnrolled} students
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-gray-500">
                    {course.progress}% complete
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm text-gray-500">{course.progress}%</span>
              </div>
              <div className="space-y-2">
                <Progress value={course.progress} />
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateProgress(Math.max(0, course.progress - 10))}
                    disabled={course.progress <= 0 || savingData}
                  >
                    {savingData ? <Loader2 className="h-4 w-4 animate-spin" /> : '-10%'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateProgress(Math.min(100, course.progress + 10))}
                    disabled={course.progress >= 100 || savingData}
                  >
                    {savingData ? <Loader2 className="h-4 w-4 animate-spin" /> : '+10%'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="materials">
              <FileText className="h-4 w-4 mr-2" />
              Study Materials
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <Brain className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {(!course.content && !generatingContent) ? (
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <BookOpen className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold">Generate Course Content</h3>
                  <p className="text-gray-600">
                    Generate comprehensive course content including overview, learning objectives,
                    key topics, and prerequisites.
                  </p>
                  <Button 
                    onClick={handleGenerateContent} 
                    disabled={generatingContent || savingData}
                    className="w-full"
                  >
                    {generatingContent ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : savingData ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Generate Content'
                    )}
                  </Button>
                </div>
              </Card>
            ) : generatingContent ? (
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p>Generating course content...</p>
                </div>
              </Card>
            ) : (
              <>
                {renderCourseContent()}
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleGenerateContent}
                    disabled={generatingContent}
                  >
                    {generatingContent ? 'Generating...' : 'Regenerate Content'}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="materials">
            {renderStudyMaterials()}
          </TabsContent>

          <TabsContent value="quiz">
            {renderQuizzes()}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CourseDetails; 