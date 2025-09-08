import { ErrorHandler } from '@/utils/errorHandler';
import { cacheService } from './CacheService';

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  description?: string;
  topic?: string;
  difficulty?: string;
  content?: CourseContent;
  study_materials?: any[]; // Assuming JSONB[] is represented as any[]
  quizzes?: any[]; // Assuming JSONB[] is represented as any[]
  progress?: number;
  start_date?: string; // Representing date as string
  end_date?: string; // Representing date as string
  created_at?: string;
}

export interface CourseContent {
  overview: string;
  learning_objectives: string[];
  key_topics: {
    title: string;
    description: string;
  }[];
  prerequisites: string[];
  [key: string]: any;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}
