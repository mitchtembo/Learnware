
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PageLayout from "@/layouts/PageLayout";
import CourseForm from "@/components/course/CourseForm";
import { generateCourseContent } from "@/services/GeminiService";
import { SupabaseApiService } from "@/services/SupabaseApiService";
import { useAuth } from "@/contexts/AuthContext";
import { Course } from "@/services/DataService";
import { toast } from "sonner";

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

const NewCourse: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const handleGenerateContent = async () => {
    const { name, topic } = form.getValues();
    if (!name || !topic) {
      toast.error("Please fill in the Course Name and Topic to generate content.");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating course content with AI...");
    try {
      const content = await generateCourseContent(name, topic);
      if (content && !content.error) {
        form.setValue("overview", content.overview || "");
        form.setValue("learning_objectives", content.learning_objectives?.map((obj: string) => ({ value: obj })) || []);
        form.setValue("key_topics", content.key_topics || []);
        form.setValue("prerequisites", content.prerequisites?.map((pre: string) => ({ value: pre })) || []);
        toast.success("Course content generated successfully!");
      } else {
        throw new Error(content.message || "Failed to generate content.");
      }
    } catch (error) {
      toast.error(`Error generating content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to create a course.");
      }
      
      const newCourse: Partial<Course> = {
        user_id: user.id,
        name: data.name,
        topic: data.topic,
        difficulty: data.difficulty,
        description: data.description,
        content: {
          overview: data.overview,
          learning_objectives: data.learning_objectives.map(o => o.value),
          key_topics: data.key_topics,
          prerequisites: data.prerequisites.map(p => p.value),
        }
      };
      
      const apiService = new SupabaseApiService();
      const createdCourse = await apiService.createCourse(newCourse);
      
      toast.success("Course created successfully!");
      navigate(`/courses/${createdCourse.id}`);

    } catch (error) {
      toast.error(`Failed to create course: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create a New Course</h1>
          <CourseForm 
            form={form}
            onSubmit={handleSubmit} 
            onGenerate={handleGenerateContent}
            isLoading={isSubmitting}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default NewCourse;
