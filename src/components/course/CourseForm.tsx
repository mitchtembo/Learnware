"use client";

import React, { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { geminiService } from "@/services/GeminiService";
import debounce from "lodash.debounce";

interface CourseFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ form, onSubmit, isLoading }) => {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleGenerateDescription = useCallback(
    debounce(async (name: string) => {
      if (!name || name.length < 5) return;
      setIsGeneratingDesc(true);
      try {
        const description = await geminiService.generateCourseDescription(name);
        form.setValue("description", description);
      } finally {
        setIsGeneratingDesc(false);
      }
    }, 1000),
    [form]
  );

  const handleFormSubmit = async (data: any) => {
    const { name, topic } = data;
    const fullCourseContent = await geminiService.generateCourseContent(name, topic || name);

    const finalData = {
      ...data,
      content: {
        overview: fullCourseContent.overview || "",
        learning_objectives: fullCourseContent.learning_objectives || [],
        key_topics: fullCourseContent.key_topics || [],
        prerequisites: fullCourseContent.prerequisites || [],
      },
      study_materials: fullCourseContent.study_materials || [],
      quizzes: fullCourseContent.quizzes || [],
    };

    onSubmit(finalData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        {...form.register("name")}
        placeholder="Course Name"
        required
        onChange={(e) => {
          form.setValue("name", e.target.value);
          handleGenerateDescription(e.target.value);
        }}
      />
      <Textarea
        {...form.register("description")}
        placeholder="Course Description (auto-generated)"
        disabled={isGeneratingDesc}
      />
      <Input {...form.register("difficulty")} placeholder="Difficulty" />
      <Input type="date" {...form.register("start_date")} placeholder="Start Date" />
      <Input type="date" {...form.register("end_date")} placeholder="End Date" />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Course"}
      </Button>
    </form>
  );
};

export default CourseForm;
