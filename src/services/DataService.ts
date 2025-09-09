import { createClient } from "@/lib/supabase/client";
import { ErrorHandler } from "@/utils/errorHandler";
import { cacheService } from "./CacheService";

const supabase = createClient();

export interface StudyMaterial {
  title: string;
  url: string;
}

export interface QuizQuestion {
  question_text: string;
  options: string[];
  answer: string;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  topic?: string;
  difficulty?: string;
  content?: any; // JSONB
  study_materials?: StudyMaterial[];
  quizzes?: Quiz[];
  progress?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const cachedCourse = cacheService.get<Course>(`course_${courseId}`);
    if (cachedCourse) return cachedCourse;

    console.log(`Fetching course ${courseId} from Supabase`);

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) throw error;
    if (!data) return null;

    cacheService.set(`course_${courseId}`, data, 600); // cache 10 mins
    return data as Course;
  } catch (error) {
    ErrorHandler.handle(error);
    return null;
  }
};
