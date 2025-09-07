import { createClient } from "@/lib/supabase/client";
import { Course } from "./DataService";

const supabase = createClient();

export const supabaseApiService = {
  async createCourse(courseData: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("courses")
      .insert([{ ...courseData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserCourses() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Return empty array if not authenticated, as this is a read operation
      return [];
    }

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return data;
  },

  async getCourseById(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourse(id: string, updatedData: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("courses")
      .update(updatedData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourse(id: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  },

  // This is a placeholder to satisfy the previous interface.
  // The new `getUserCourses` should be used instead.
  async getCourses(): Promise<Course[]> {
    return this.getUserCourses();
  },

  // This is a placeholder, assuming no initialization is needed for the singleton.
  async initialize(): Promise<void> {
    return Promise.resolve();
  },

  // The adapter also calls notes methods, which are not in the prompt.
  // I will add dummy methods for them to avoid breaking the adapter.
  async getNotes(): Promise<any[]> {
    console.warn("getNotes not implemented in SupabaseApiService");
    return [];
  },
  async getNoteById(id: string): Promise<any | null> {
    console.warn("getNoteById not implemented in SupabaseApiService");
    return null;
  },
  async getNotesByCourse(courseId: string): Promise<any[]> {
    console.warn("getNotesByCourse not implemented in SupabaseApiService");
    return [];
  },
  async createNote(noteData: any): Promise<any> {
    console.warn("createNote not implemented in SupabaseApiService");
    return {};
  },
  async updateNote(id: string, noteData: any): Promise<any> {
    console.warn("updateNote not implemented in SupabaseApiService");
    return {};
  },
  async deleteNote(id: string): Promise<boolean> {
    console.warn("deleteNote not implemented in SupabaseApiService");
    return false;
  }
};
