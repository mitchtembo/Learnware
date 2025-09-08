// SupabaseApiService.ts
import { createClient } from "@/lib/supabase/client";
import type { Course, Note } from "./DataService";

const supabase = createClient();

const supabaseApiService = {
    async initialize() {
        // Supabase client is already initialized in client.ts; nothing to do here.
    },

    // Courses
    async getCourses(): Promise<Course[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("user_id", user.id);

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getCourseById(id: string): Promise<Course | null> {
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", id)
            .single();

        if (error?.code === "PGRST116") return null; // row not found
        if (error) throw new Error(error.message);
        return data;
    },

    async createCourse(courseData: Omit<Course, "id" | "createdAt" | "updatedAt" | "user_id">): Promise<Course> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Remove any leftover `code` field if present
        const { code, ...courseToInsert } = courseData;

        const { data, error } = await supabase
            .from("courses")
            .insert({ ...courseToInsert, user_id: user.id })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
        const { data, error } = await supabase
            .from("courses")
            .update(courseData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async deleteCourse(id: string): Promise<boolean> {
        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
        return true;
    },

    // Notes
    async getNotes(): Promise<Note[]> {
        const { data, error } = await supabase.from("notes").select("*");
        if (error) throw new Error(error.message);
        return data || [];
    },

    async getNoteById(id: string): Promise<Note | null> {
        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("id", id)
            .single();

        if (error?.code === "PGRST116") return null;
        if (error) throw new Error(error.message);
        return data;
    },

    async getNotesByCourse(courseId: string): Promise<Note[]> {
        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("course_id", courseId);

        if (error) throw new Error(error.message);
        return data || [];
    },

    async createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
        const { data, error } = await supabase
            .from("notes")
            .insert(noteData)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
        const { data, error } = await supabase
            .from("notes")
            .update(noteData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async deleteNote(id: string): Promise<boolean> {
        const { error } = await supabase
            .from("notes")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
        return true;
    }
};

// Adapter
class ApiServiceAdapter {
    private initialized = false;

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
export { supabaseApiService };
