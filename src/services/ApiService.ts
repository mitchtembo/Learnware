import { Course, Note } from './DataService';

// In-memory data store
let courses: Course[] = [];
let notes: Note[] = [];

// Mock API delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ApiService: A mock API service that simulates server-side storage
 * This can be easily replaced with actual API calls in the future
 */
class ApiService {
  // Course API methods
  async getCourses(): Promise<Course[]> {
    await delay(300); // Simulate network delay
    return [...courses];
  }

  async getCourseById(id: string): Promise<Course | null> {
    await delay(200);
    const course = courses.find(c => c.id === id);
    return course ? { ...course } : null;
  }

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    await delay(400);
    const now = new Date();
    const newCourse: Course = {
      ...courseData,
      id: this.generateId(),
      progress: courseData.progress || 0,
      studentsEnrolled: courseData.studentsEnrolled || 0,
      createdAt: now,
      updatedAt: now
    };
    
    courses.push(newCourse);
    return { ...newCourse };
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    await delay(400);
    const index = courses.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    const updatedCourse = {
      ...courses[index],
      ...courseData,
      updatedAt: new Date()
    };
    
    courses[index] = updatedCourse;
    return { ...updatedCourse };
  }

  async deleteCourse(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = courses.length;
    courses = courses.filter(c => c.id !== id);
    return courses.length < initialLength;
  }

  // Note API methods
  async getNotes(): Promise<Note[]> {
    await delay(300);
    return [...notes];
  }

  async getNoteById(id: string): Promise<Note | null> {
    await delay(200);
    const note = notes.find(n => n.id === id);
    return note ? { ...note } : null;
  }

  async getNotesByCourse(courseId: string): Promise<Note[]> {
    await delay(300);
    return notes.filter(n => n.courseId === courseId).map(n => ({ ...n }));
  }

  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    await delay(400);
    const now = new Date();
    const newNote: Note = {
      ...noteData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    notes.push(newNote);
    return { ...newNote };
  }

  async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
    await delay(400);
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) {
      throw new Error(`Note with ID ${id} not found`);
    }
    
    const updatedNote = {
      ...notes[index],
      ...noteData,
      updatedAt: new Date()
    };
    
    notes[index] = updatedNote;
    return { ...updatedNote };
  }

  async deleteNote(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = notes.length;
    notes = notes.filter(n => n.id !== id);
    return notes.length < initialLength;
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Initialize with sample data
  async initialize(): Promise<void> {
    // Only initialize if no data exists
    if (courses.length === 0) {
      const now = new Date();
      courses.push({
        id: this.generateId(),
        name: "Introduction to Web Development",
        code: "WEB101",
        description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
        category: "programming",
        difficulty: "beginner",
        progress: 0,
        startDate: now,
        endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        studentsEnrolled: 0,
        createdAt: now,
        updatedAt: now
      });
    }

    if (notes.length === 0) {
      const now = new Date();
      notes.push({
        id: this.generateId(),
        title: "Getting Started with Learning",
        content: "Welcome to Learnware Grove! Start by creating courses and exploring AI-generated content.",
        tags: ["welcome", "tutorial"],
        createdAt: now,
        updatedAt: now
      });
    }
  }
}

export const apiService = new ApiService();
