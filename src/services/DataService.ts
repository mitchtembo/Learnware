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
  private COURSES_KEY = 'learnware_courses';
  private NOTES_KEY = 'learnware_notes';

  // Course Methods
  getCourses(): Course[] {
    const coursesJson = localStorage.getItem(this.COURSES_KEY);
    if (!coursesJson) return [];
    
    try {
      // Parse the JSON string and convert date strings back to Date objects
      const courses = JSON.parse(coursesJson);
      return courses.map((course: any) => ({
        ...course,
        startDate: new Date(course.startDate),
        endDate: new Date(course.endDate),
        createdAt: new Date(course.createdAt),
        updatedAt: new Date(course.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing courses:', error);
      return [];
    }
  }

  getCourseById(id: string): Course | undefined {
    const courses = this.getCourses();
    return courses.find(course => course.id === id);
  }

  saveCourse(course: Course): Course {
    const courses = this.getCourses();
    const now = new Date();
    
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
      
      courses.push(newCourse);
      this.saveCourses(courses);
      return newCourse;
    } else {
      // Update existing course
      const index = courses.findIndex(c => c.id === course.id);
      if (index !== -1) {
        courses[index] = {
          ...courses[index],
          ...course,
          updatedAt: now
        };
        this.saveCourses(courses);
        return courses[index];
      }
      
      throw new Error(`Course with ID ${course.id} not found`);
    }
  }

  deleteCourse(id: string): boolean {
    const courses = this.getCourses();
    const filteredCourses = courses.filter(course => course.id !== id);
    
    if (filteredCourses.length < courses.length) {
      this.saveCourses(filteredCourses);
      return true;
    }
    
    return false;
  }

  updateCourseProgress(id: string, progress: number): boolean {
    const courses = this.getCourses();
    const course = courses.find(course => course.id === id);
    
    if (course) {
      course.progress = Math.min(100, Math.max(0, progress));
      course.updatedAt = new Date();
      this.saveCourses(courses);
      return true;
    }
    
    return false;
  }

  // Note Methods
  getNotes(): Note[] {
    const notesJson = localStorage.getItem(this.NOTES_KEY);
    if (!notesJson) return [];
    
    try {
      const notes = JSON.parse(notesJson);
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing notes:', error);
      return [];
    }
  }

  getNotesByCourse(courseId: string): Note[] {
    const notes = this.getNotes();
    return notes.filter(note => note.courseId === courseId);
  }

  saveNote(note: Note): Note {
    const notes = this.getNotes();
    const now = new Date();
    
    if (!note.id) {
      // Create new note
      const newNote: Note = {
        ...note,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      };
      
      notes.push(newNote);
      this.saveNotes(notes);
      return newNote;
    } else {
      // Update existing note
      const index = notes.findIndex(n => n.id === note.id);
      if (index !== -1) {
        notes[index] = {
          ...notes[index],
          ...note,
          updatedAt: now
        };
        this.saveNotes(notes);
        return notes[index];
      }
      
      throw new Error(`Note with ID ${note.id} not found`);
    }
  }

  deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    
    if (filteredNotes.length < notes.length) {
      this.saveNotes(filteredNotes);
      return true;
    }
    
    return false;
  }

  // Helper methods
  private saveCourses(courses: Course[]): void {
    localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
  }

  private saveNotes(notes: Note[]): void {
    localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Initialize with sample data if empty
  initializeIfEmpty(): void {
    const courses = this.getCourses();
    if (courses.length === 0) {
      const sampleCourse = {
        name: "Introduction to Web Development",
        code: "WEB101",
        description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
        category: "programming",
        difficulty: "beginner",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      };
      this.saveCourse(sampleCourse);
    }

    const notes = this.getNotes();
    if (notes.length === 0) {
      const sampleNote = {
        title: "Getting Started with Learning",
        content: "Welcome to Learnware Grove! Start by creating courses and exploring AI-generated content.",
        tags: ["welcome", "tutorial"]
      };
      this.saveNote(sampleNote as Note);
    }
  }
}

export const dataService = new DataService(); 