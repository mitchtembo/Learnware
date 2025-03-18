import { ErrorHandler } from '@/utils/errorHandler';
import { mongoDBService } from './MongoDBService';
import { databaseService } from './DatabaseService';

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
      // Check if we need to migrate from IndexedDB
      const migrationCompleteToMongo = await mongoDBService.getSetting('migrationCompleteToMongo');
      
      if (!migrationCompleteToMongo) {
        await this.migrateFromIndexedDBToMongoDB();
      }
      
      // Initialize with sample data if empty
      await this.initializeIfEmpty();
      
      this.initialized = true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      this.initialized = false;
    }
  }

  private async migrateFromIndexedDBToMongoDB(): Promise<void> {
    try {
      // Get data from IndexedDB
      const indexedDBCourses = await databaseService.getAll<Course>('courses');
      const indexedDBNotes = await databaseService.getAll<Course>('notes');

      // Migrate to MongoDB
      await mongoDBService.migrateFromLocal({
        courses: indexedDBCourses,
        notes: indexedDBNotes
      });

      // Set migration complete flag
      await mongoDBService.setSetting('migrationCompleteToMongo', true);
      
      console.log('Migration from IndexedDB to MongoDB complete');
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
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
      const courses = await mongoDBService.getAllCourses();
      return courses.map(course => ({
        ...course,
        id: course._id.toString(),
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
      const course = await mongoDBService.getCourseById(id);
      if (!course) return undefined;
      
      return {
        ...course,
        id: course._id.toString(),
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
        const newCourse: any = {
          ...course,
          progress: 0,
          studentsEnrolled: 0,
          createdAt: now,
          updatedAt: now
        };
        
        const createdCourse = await mongoDBService.createCourse(newCourse);
        return {
          ...createdCourse,
          id: createdCourse._id.toString(),
          startDate: new Date(createdCourse.startDate),
          endDate: new Date(createdCourse.endDate),
          createdAt: new Date(createdCourse.createdAt),
          updatedAt: new Date(createdCourse.updatedAt)
        };
      } else {
        // Update existing course
        const courseData = {
          ...course,
          _id: course.id,
          updatedAt: now
        };
        delete courseData.id; // Remove id as MongoDB uses _id
        
        const updatedCourse = await mongoDBService.updateCourse(course.id, courseData);
        if (!updatedCourse) {
          throw ErrorHandler.handle({
            code: 'NOT_FOUND',
            message: `Course with ID ${course.id} not found`
          });
        }
        
        return {
          ...updatedCourse,
          id: updatedCourse._id.toString(),
          startDate: new Date(updatedCourse.startDate),
          endDate: new Date(updatedCourse.endDate),
          createdAt: new Date(updatedCourse.createdAt),
          updatedAt: new Date(updatedCourse.updatedAt)
        };
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
      return await mongoDBService.deleteCourse(id);
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
      const notes = await mongoDBService.getAllNotes();
      return notes.map(note => ({
        ...note,
        id: note._id.toString(),
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
      const notes = await mongoDBService.getNotesByCourse(courseId);
      return notes.map(note => ({
        ...note,
        id: note._id.toString(),
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
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
        const newNote: any = {
          ...note,
          createdAt: now,
          updatedAt: now
        };
        
        const createdNote = await mongoDBService.createNote(newNote);
        return {
          ...createdNote,
          id: createdNote._id.toString(),
          createdAt: new Date(createdNote.createdAt),
          updatedAt: new Date(createdNote.updatedAt)
        };
      } else {
        // Update existing note
        const noteData = {
          ...note,
          _id: note.id,
          updatedAt: now
        };
        delete noteData.id; // Remove id as MongoDB uses _id
        
        const updatedNote = await mongoDBService.updateNote(note.id, noteData);
        if (!updatedNote) {
          throw ErrorHandler.handle({
            code: 'NOT_FOUND',
            message: `Note with ID ${note.id} not found`
          });
        }
        
        return {
          ...updatedNote,
          id: updatedNote._id.toString(),
          createdAt: new Date(updatedNote.createdAt),
          updatedAt: new Date(updatedNote.updatedAt)
        };
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
      return await mongoDBService.deleteNote(id);
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
        name: "Introduction to Web Development",
        code: "WEB101",
        description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
        category: "programming",
        difficulty: "beginner",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      } as Course;
      
      await this.saveCourse(sampleCourse);
    }

    const notes = await this.getNotes();
    
    if (notes.length === 0) {
      const sampleNote = {
        title: "Getting Started with Learning",
        content: "Welcome to Learnware Grove! Start by creating courses and exploring AI-generated content.",
        tags: ["welcome", "tutorial"]
      } as Note;
      
      await this.saveNote(sampleNote);
    }
  }
}

export const dataService = new DataService(); 