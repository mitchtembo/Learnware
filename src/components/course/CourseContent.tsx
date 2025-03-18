import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  BookOpen,
  Brain,
  CheckCircle,
  FileText,
  GraduationCap,
  List,
} from "lucide-react";
import { GeminiService, CourseContent as CourseContentType } from "@/utils/geminiService";
import { useToast } from "@/components/ui/use-toast";

interface CourseContentProps {
  courseName: string;
  description: string;
  difficulty: string;
}

export function CourseContent({ courseName, description, difficulty }: CourseContentProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<CourseContentType | null>(null);

  const generateContent = async () => {
    setIsLoading(true);
    try {
      const generatedContent = await GeminiService.generateCourseContent(
        courseName,
        description,
        difficulty
      );
      setContent(generatedContent);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate course content. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!content && !isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <GraduationCap className="h-12 w-12 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Generate Course Content</h3>
          <p className="text-muted-foreground">
            Use AI to generate comprehensive course materials including syllabus,
            key topics, and learning objectives.
          </p>
          <Button onClick={generateContent} className="w-full">
            Generate Content
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p>Generating course content...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Course Overview</h3>
        <p className="text-muted-foreground">{content?.overview}</p>
      </Card>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="syllabus">
          <AccordionTrigger className="bg-card p-4 rounded-lg hover:no-underline">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <span>Syllabus</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <ol className="list-decimal list-inside space-y-2">
              {content?.syllabus.map((item, index) => (
                <li key={index} className="text-muted-foreground">
                  {item}
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="key-topics">
          <AccordionTrigger className="bg-card p-4 rounded-lg hover:no-underline">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span>Key Topics</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-4">
              {content?.keyTopics.map((topic, index) => (
                <Card key={index} className="p-4">
                  <h4 className="font-semibold mb-2">{topic.title}</h4>
                  <p className="text-muted-foreground">{topic.description}</p>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="learning-objectives">
          <AccordionTrigger className="bg-card p-4 rounded-lg hover:no-underline">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Learning Objectives</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <ul className="space-y-2">
              {content?.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{objective}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="readings">
          <AccordionTrigger className="bg-card p-4 rounded-lg hover:no-underline">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>Recommended Readings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-2">
              {content?.recommendedReadings.map((reading, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-2">
                    <Book className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{reading.title}</span>
                  </div>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button onClick={generateContent} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Regenerate Content
        </Button>
      </div>
    </div>
  );
} 