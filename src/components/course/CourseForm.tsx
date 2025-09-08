
import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2, Wand2 } from "lucide-react";

interface CourseFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isGenerating: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ form, onSubmit, onGenerate, isLoading, isGenerating }) => {
  
  const { fields: objectives, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "learning_objectives",
  });

  const { fields: topics, append: appendTopic, remove: removeTopic } = useFieldArray({
    control: form.control,
    name: "key_topics",
  });
  
  const { fields: prerequisites, append: appendPrerequisite, remove: removePrerequisite } = useFieldArray({
    control: form.control,
    name: "prerequisites",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Start by defining the course name, topic, and other essential details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Introduction to React" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl><Input placeholder="e.g., Web Development" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <FormControl><Input placeholder="e.g., Beginner" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Briefly describe the course." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Fill this in manually or use AI to generate it based on the name and topic.</CardDescription>
                </div>
                <Button type="button" onClick={onGenerate} disabled={isGenerating}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate Content with AI"}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
          <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overview</FormLabel>
                  <FormControl><Textarea placeholder="Provide a detailed overview of the course." {...field} rows={4} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Learning Objectives</FormLabel>
              {objectives.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mt-2">
                  <FormField
                    control={form.control}
                    name={`learning_objectives.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl><Input placeholder="e.g., Understand component lifecycle" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeObjective(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendObjective({ value: "" })}><PlusCircle className="h-4 w-4 mr-2" />Add Objective</Button>
            </div>
            
            <div>
              <FormLabel>Key Topics</FormLabel>
              {topics.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 mt-2 p-3 border rounded">
                   <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Topic {index + 1}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTopic(index)}><Trash2 className="h-4 w-4" /></Button>
                   </div>
                  <FormField
                    control={form.control}
                    name={`key_topics.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Title</FormLabel>
                        <FormControl><Input placeholder="e.g., State Management" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`key_topics.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Description</FormLabel>
                        <FormControl><Textarea placeholder="e.g., Using hooks like useState and useReducer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendTopic({ title: "", description: "" })}><PlusCircle className="h-4 w-4 mr-2" />Add Topic</Button>
            </div>

            <div>
              <FormLabel>Prerequisites</FormLabel>
              {prerequisites.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mt-2">
                  <FormField
                    control={form.control}
                    name={`prerequisites.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl><Input placeholder="e.g., Basic JavaScript knowledge" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePrerequisite(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendPrerequisite({ value: "" })}><PlusCircle className="h-4 w-4 mr-2" />Add Prerequisite</Button>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading || isGenerating} className="w-full sm:w-auto">
          {isLoading ? "Creating Course..." : "Create Course"}
        </Button>
      </form>
    </Form>
  );
};

export default CourseForm;
