import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { geminiService } from "../../services/GeminiService";
import { useToast } from "@/components/ui/use-toast";
import { CourseContent } from "@/services/DataService";

const formSchema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters"),
  description: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  onSubmit: (data: any, content: CourseContent | null) => void;
  initialData?: Partial<CourseFormValues>;
  isSubmitting?: boolean;
}

export function CourseForm({ onSubmit, initialData, isSubmitting = false }: CourseFormProps) {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<CourseContent | null>(null);
  const { toast } = useToast();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      topic: initialData?.topic || "",
      difficulty: initialData?.difficulty || "",
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      end_date: initialData?.end_date ? new Date(initialData.end_date) : undefined,
    },
  });

  const generateDescription = async (courseName: string) => {
    if (courseName.length < 3) return;
    
    try {
      setIsGeneratingDescription(true);
      const description = await geminiService.generateCourseDescription(courseName);
      form.setValue('description', description, { shouldValidate: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate course description",
        variant: "destructive",
      });
      console.error("Error generating description:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateContent = async () => {
    const topic = form.getValues("topic");
    const description = form.getValues("description");
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingContent(true);
      const content = await geminiService.generateCourseContent(topic, description);
      setGeneratedContent(content);
      toast({
        title: "Content Generated",
        description: "Course content has been successfully generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate course content.",
        variant: "destructive",
      });
      console.error("Error generating content:", error);
    } finally {
      setIsGeneratingContent(false);
    }
  };
  
  const handleFormSubmit = (data: CourseFormValues) => {
    onSubmit(data, generatedContent);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Introduction to Computer Science" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    // Only auto-generate if description is empty
                    if (!form.getValues('description')) {
                      const debouncedGenerate = setTimeout(() => {
                        generateDescription(e.target.value);
                      }, 300);
                      return () => clearTimeout(debouncedGenerate);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Description</FormLabel>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => generateDescription(form.getValues('name'))}
                  disabled={isGeneratingDescription || !form.getValues('name')}
                >
                  {isGeneratingDescription ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Generate
                </Button>
              </div>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Enter course description..."
                    {...field}
                    disabled={isGeneratingDescription}
                  />
                  {isGeneratingDescription && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Frontend Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center">
            <Button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGeneratingContent || !form.getValues('topic')}
                className="w-full"
            >
                {isGeneratingContent ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                )}
                Generate Course Content
            </Button>
        </div>

        {generatedContent && (
            <div className="p-4 border rounded-md bg-muted">
                <h4 className="font-semibold">Generated Content Preview</h4>
                <p className="text-sm text-muted-foreground">Overview: {generatedContent.overview}</p>
                <p className="text-sm text-muted-foreground">Objectives: {generatedContent.learning_objectives.join(', ')}</p>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const endDate = form.getValues("end_date");
                        return date < new Date() || (endDate ? date > endDate : false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < (form.getValues('start_date') || new Date())
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting || isGeneratingContent}>
          {isSubmitting || isGeneratingContent ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating Course..." : "Generating Course Content..."}
            </>
          ) : (
            initialData ? "Update Course" : "Create Course"
          )}
        </Button>
      </form>
    </Form>
  );
}
