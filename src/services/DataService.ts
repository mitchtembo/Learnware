import { ErrorHandler } from '@/utils/errorHandler';
import { cacheService } from './CacheService';

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  content?: CourseContent;
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
