import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ApiService } from "./ApiService";
import { Course, Note } from "./DataService";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export class SupabaseApiService implements ApiService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async initialize(): Promise<void> {
        // No-op for now
        return Promise.resolve();
    }

    async getCourses(): Promise<Course[]> {
        const { data, error } = await this.supabase
            .from('courses')
            .select('*');
        if (error) {
            throw new Error(error.message);
        }
        return data as Course[];
    }

    async getCourseById(id: string): Promise<Course | null> {
        const { data, error } = await this.supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') { // PostgREST error for no rows found
                return null;
            }
            throw new Error(error.message);
        }
        return data as Course | null;
    }

    async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Course> {
        const { data, error } = await this.supabase
            .from('courses')
            .insert([course])
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data as Course;
    }

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
        const { data, error } = await this.supabase
            .from('courses')
            .update(courseData)
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data as Course;
    }

    async deleteCourse(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('courses')
            .delete()
            .eq('id', id);
        if (error) {
            throw new Error(error.message);
        }
        return true;
    }

    async getNotes(): Promise<Note[]> {
        const { data, error } = await this.supabase
            .from('notes')
            .select('*');
        if (error) {
            throw new Error(error.message);
        }
        return data as Note[];
    }

    async getNoteById(id: string): Promise<Note | null> {
        const { data, error } = await this.supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(error.message);
        }
        return data as Note | null;
    }

    async getNotesByCourse(courseId: string): Promise<Note[]> {
        const { data, error } = await this.supabase
            .from('notes')
            .select('*')
            .eq('course_id', courseId);
        if (error) {
            throw new Error(error.message);
        }
        return data as Note[];
    }

    async createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
        const { data, error } = await this.supabase
            .from('notes')
            .insert([noteData])
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data as Note;
    }

    async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
        const { data, error } = await this.supabase
            .from('notes')
            .update(noteData)
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(error.message);
        }
        return data as Note;
    }

    async deleteNote(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('notes')
            .delete()
            .eq('id', id);
        if (error) {
            throw new Error(error.message);
        }
        return true;
    }
}

export const supabaseApiService = new SupabaseApiService();
