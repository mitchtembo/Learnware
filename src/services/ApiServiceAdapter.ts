import { supabaseApiService } from "./SupabaseApiService";
import type { Course, Note } from "./DataService";

class ApiServiceAdapter {
    private initialized = false;

    // Call this at app start
    async initialize() {
        if (!this.initialized) {
            await supabaseApiService.initialize();
            this.initialized = true;
        }
    }

    // Courses
    async getCourses(): Promise<Course[]> {
        await this.initialize();
        return supabaseApiService.getCourses();
    }

    async getCourseById(id: string): Promise<Course | null> {
        await this.initialize();
        return supabaseApiService.getCourseById(id);
    }

    async createCourse(courseData: Omit<Course, "id" | "createdAt" | "updatedAt" | "user_id">): Promise<Course> {
        await this.initialize();
        return supabaseApiService.createCourse(courseData);
    }

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
        await this.initialize();
        return supabaseApiService.updateCourse(id, courseData);
    }

    async deleteCourse(id: string): Promise<boolean> {
        await this.initialize();
        return supabaseApiService.deleteCourse(id);
    }

    // Notes
    async getNotes(): Promise<Note[]> {
        await this.initialize();
        return supabaseApiService.getNotes();
    }

    async getNoteById(id: string): Promise<Note | null> {
        await this.initialize();
        return supabaseApiService.getNoteById(id);
    }

    async getNotesByCourse(courseId: string): Promise<Note[]> {
        await this.initialize();
        return supabaseApiService.getNotesByCourse(courseId);
    }

    async createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
        await this.initialize();
        return supabaseApiService.createNote(noteData);
    }

    async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
        await this.initialize();
        return supabaseApiService.updateNote(id, noteData);
    }

    async deleteNote(id: string): Promise<boolean> {
        await this.initialize();
        return supabaseApiService.deleteNote(id);
    }
}

export const apiService = new ApiServiceAdapter();
