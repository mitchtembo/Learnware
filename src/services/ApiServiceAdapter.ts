import { supabaseApiService } from "./SupabaseApiService"
import type { Course, Note } from "./DataService"

/**
 * ApiServiceAdapter: Adapter to maintain compatibility with existing frontend code
 * This allows us to switch from mock API to Supabase without changing frontend components
 */
class ApiServiceAdapter {
  // Course API methods - delegate to Supabase service
  async getCourses(): Promise<Course[]> {
    return supabaseApiService.getCourses()
  }

  async getCourseById(id: string): Promise<Course | null> {
    return supabaseApiService.getCourseById(id)
  }

  async createCourse(courseData: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<Course> {
    return supabaseApiService.createCourse(courseData)
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    return supabaseApiService.updateCourse(id, courseData)
  }

  async deleteCourse(id: string): Promise<boolean> {
    return supabaseApiService.deleteCourse(id)
  }

  // Note API methods - delegate to Supabase service
  async getNotes(): Promise<Note[]> {
    return supabaseApiService.getNotes()
  }

  async getNoteById(id: string): Promise<Note | null> {
    return supabaseApiService.getNoteById(id)
  }

  async getNotesByCourse(courseId: string): Promise<Note[]> {
    return supabaseApiService.getNotesByCourse(courseId)
  }

  async createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    return supabaseApiService.createNote(noteData)
  }

  async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
    return supabaseApiService.updateNote(id, noteData)
  }

  async deleteNote(id: string): Promise<boolean> {
    return supabaseApiService.deleteNote(id)
  }

  // Helper methods for compatibility
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  async initialize(): Promise<void> {
    return supabaseApiService.initialize()
  }
}

export const apiService = new ApiServiceAdapter()
