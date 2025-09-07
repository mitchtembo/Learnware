import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ApiService } from "./ApiService";
import { Course } from "./DataService";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export class SupabaseApiService implements ApiService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        this.supabase = createClient(supabaseUrl, supabaseKey);
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
}
