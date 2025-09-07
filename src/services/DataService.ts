import { ErrorHandler } from '@/utils/errorHandler';
import { cacheService } from './CacheService';

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  difficulty: string;
  progress: number;
  startDate: Date;
  endDate: Date;
  studentsEnrolled: number;
  content?: any;
  studyMaterials?: any[];
  quizzes?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  courseId?: string;
  createdAt: Date;
  updatedAt: Date;
}

class DataService {
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize with sample data if empty
      await this.initializeIfEmpty();
      
      this.initialized = true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      this.initialized = false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }
  }

  // Course Methods
  async getCourses(): Promise<Course[]> {
    await this.ensureInitialized();
    
    try {
      const courses = await cacheService.getAll<Course>('courses');
      return courses.map(course => ({
        ...course,
        startDate: new Date(course.startDate),
        endDate: new Date(course.endDate),
        createdAt: new Date(course.createdAt),
        updatedAt: new Date(course.updatedAt)
      }));
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    await this.ensureInitialized();
    
    try {
      const course = await cacheService.get<Course>('courses', id);
      if (!course) return undefined;
      
      return {
        ...course,
        startDate: new Date(course.startDate),
        endDate: new Date(course.endDate),
        createdAt: new Date(course.createdAt),
        updatedAt: new Date(course.updatedAt)
      };
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return undefined;
    }
  }

  async saveCourse(course: Course): Promise<Course> {
    await this.ensureInitialized();
    
    const now = new Date();
    
    try {
      if (!course.id) {
        // Create new course
        const newCourse: Course = {
          ...course,
          id: this.generateId(),
          progress: 0,
          studentsEnrolled: 0,
          createdAt: now,
          updatedAt: now
        };
        
        await cacheService.set('courses', newCourse.id, newCourse);
        return newCourse;
      } else {
        // Update existing course
        const updatedCourse = {
          ...course,
          updatedAt: now
        };
        
        await cacheService.set('courses', course.id, updatedCourse);
        return updatedCourse;
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      await cacheService.delete('courses', id);
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return false;
    }
  }

  async updateCourseProgress(id: string, progress: number): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      const course = await this.getCourseById(id);
      
      if (!course) {
        return false;
      }
      
      course.progress = Math.min(100, Math.max(0, progress));
      course.updatedAt = new Date();
      
      await this.saveCourse(course);
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return false;
    }
  }

  // Note Methods
  async getNotes(): Promise<Note[]> {
    await this.ensureInitialized();
    
    try {
      const notes = await cacheService.getAll<Note>('notes');
       return notes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return [];
    }
  }

  async getNotesByCourse(courseId: string): Promise<Note[]> {
    await this.ensureInitialized();
    
    try {
      const allNotes = await this.getNotes();
      return allNotes.filter(note => note.courseId === courseId);
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return [];
    }
  }

  async saveNote(note: Note): Promise<Note> {
    await this.ensureInitialized();
    
    const now = new Date();
    
    try {
      if (!note.id) {
        // Create new note
        const newNote: Note = {
          ...note,
          id: this.generateId(),
          createdAt: now,
          updatedAt: now
        };
        
        await cacheService.set('notes', newNote.id, newNote);
        return newNote;
      } else {
        // Update existing note
        const updatedNote = {
          ...note,
          updatedAt: now
        };
        
        await cacheService.set('notes', note.id, updatedNote);
        return updatedNote;
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      await cacheService.delete('notes', id);
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return false;
    }
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Initialize with sample data if empty
  private async initializeIfEmpty(): Promise<void> {
    const courses = await this.getCourses();
    
    if (courses.length === 0) {
      const sampleCourse = {
        id: this.generateId(),
        name: "Introduction to Web Development",
        code: "WEB101",
        description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
        category: "programming",
        difficulty: "beginner",
        progress: 0,
        studentsEnrolled: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      } as Course;
      
      await this.saveCourse(sampleCourse);
    }

    const notes = await this.getNotes();
    
    if (notes.length === 0) {
      const sampleNote = {
        id: this.generateId(),
        title: "Getting Started with Learning",
        content: "Welcome to Learnware Grove! Start by creating courses and exploring AI-generated content.",
        tags: ["welcome", "tutorial"],
        createdAt: new Date(),
        updatedAt: new Date()
      } as Note;
      
      await this.saveNote(sampleNote);
    }
  }
}

export const dataService = new DataService();
