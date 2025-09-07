import { createClient } from "../lib/supabase/client"
import type { Course, Note } from "./DataService"

export interface SupabaseCourse {
  id: string
  title: string
  description: string
  content: any
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  tags: string[]
  user_id: string
  created_at: string
  updated_at: string
}

export interface SupabaseNote {
  id: string
  title: string
  content: string
  course_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface SupabaseProgress {
  id: string
  user_id: string
  course_id: string
  completed_sections: any[]
  progress_percentage: number
  last_accessed: string
  created_at: string
  updated_at: string
}

/**
 * SupabaseApiService: Real API service that connects to Supabase backend
 * Replaces the mock ApiService with actual database operations
 */
class SupabaseApiService {
  private supabase = createClient()

  // Helper method to convert Supabase course to frontend Course type
  private mapSupabaseCourseToFrontend(supabaseCourse: SupabaseCourse, progress?: SupabaseProgress): Course {
    return {
      id: supabaseCourse.id,
      name: supabaseCourse.title,
      code: `COURSE-${supabaseCourse.id.slice(0, 6).toUpperCase()}`,
      description: supabaseCourse.description || "",
      category: supabaseCourse.tags?.[0] || "general",
      difficulty: supabaseCourse.difficulty || "beginner",
      progress: progress?.progress_percentage || 0,
      startDate: new Date(supabaseCourse.created_at),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from creation
      studentsEnrolled: 1, // Single user for now
      content: supabaseCourse.content,
      createdAt: new Date(supabaseCourse.created_at),
      updatedAt: new Date(supabaseCourse.updated_at),
    }
  }

  // Helper method to convert frontend Course to Supabase course
  private mapFrontendCourseToSupabase(course: Partial<Course>, userId: string): Partial<SupabaseCourse> {
    return {
      title: course.name || "",
      description: course.description || "",
      content: course.content || null,
      difficulty: (course.difficulty as "beginner" | "intermediate" | "advanced") || "beginner",
      duration: 60, // Default duration
      tags: course.category ? [course.category] : [],
      user_id: userId,
    }
  }

  // Helper method to convert Supabase note to frontend Note type
  private mapSupabaseNoteToFrontend(supabaseNote: SupabaseNote): Note {
    return {
      id: supabaseNote.id,
      title: supabaseNote.title,
      content: supabaseNote.content,
      tags: [], // We'll need to add tags support later
      courseId: supabaseNote.course_id,
      createdAt: new Date(supabaseNote.created_at),
      updatedAt: new Date(supabaseNote.updated_at),
    }
  }

  // Course API methods
  async getCourses(): Promise<Course[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: courses, error } = await this.supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get progress for all courses
      const { data: progressData } = await this.supabase.from("progress").select("*").eq("user_id", user.id)

      const progressMap = new Map(progressData?.map((p) => [p.course_id, p]) || [])

      return courses?.map((course) => this.mapSupabaseCourseToFrontend(course, progressMap.get(course.id))) || []
    } catch (error) {
      console.error("Error fetching courses:", error)
      return []
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: course, error } = await this.supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      // Get progress for this course
      const { data: progress } = await this.supabase
        .from("progress")
        .select("*")
        .eq("course_id", id)
        .eq("user_id", user.id)
        .single()

      return course ? this.mapSupabaseCourseToFrontend(course, progress || undefined) : null
    } catch (error) {
      console.error("Error fetching course:", error)
      return null
    }
  }

  async createCourse(courseData: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<Course> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const supabaseCourseData = this.mapFrontendCourseToSupabase(courseData, user.id)

      const { data: course, error } = await this.supabase.from("courses").insert([supabaseCourseData]).select().single()

      if (error) throw error

      // Create initial progress record
      await this.supabase.from("progress").insert([
        {
          user_id: user.id,
          course_id: course.id,
          completed_sections: [],
          progress_percentage: 0,
        },
      ])

      return this.mapSupabaseCourseToFrontend(course)
    } catch (error) {
      console.error("Error creating course:", error)
      throw error
    }
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const supabaseCourseData = this.mapFrontendCourseToSupabase(courseData, user.id)

      const { data: course, error } = await this.supabase
        .from("courses")
        .update(supabaseCourseData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      return this.mapSupabaseCourseToFrontend(course)
    } catch (error) {
      console.error("Error updating course:", error)
      throw error
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await this.supabase.from("courses").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting course:", error)
      return false
    }
  }

  // Note API methods
  async getNotes(): Promise<Note[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: notes, error } = await this.supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      return notes?.map((note) => this.mapSupabaseNoteToFrontend(note)) || []
    } catch (error) {
      console.error("Error fetching notes:", error)
      return []
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: note, error } = await this.supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      return note ? this.mapSupabaseNoteToFrontend(note) : null
    } catch (error) {
      console.error("Error fetching note:", error)
      return null
    }
  }

  async getNotesByCourse(courseId: string): Promise<Note[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: notes, error } = await this.supabase
        .from("notes")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      return notes?.map((note) => this.mapSupabaseNoteToFrontend(note)) || []
    } catch (error) {
      console.error("Error fetching course notes:", error)
      return []
    }
  }

  async createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: note, error } = await this.supabase
        .from("notes")
        .insert([
          {
            title: noteData.title,
            content: noteData.content,
            course_id: noteData.courseId || null,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      return this.mapSupabaseNoteToFrontend(note)
    } catch (error) {
      console.error("Error creating note:", error)
      throw error
    }
  }

  async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: note, error } = await this.supabase
        .from("notes")
        .update({
          title: noteData.title,
          content: noteData.content,
          course_id: noteData.courseId || null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      return this.mapSupabaseNoteToFrontend(note)
    } catch (error) {
      console.error("Error updating note:", error)
      throw error
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await this.supabase.from("notes").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting note:", error)
      return false
    }
  }

  // Progress tracking methods
  async updateCourseProgress(courseId: string, progress: number, completedSections: any[] = []): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await this.supabase.from("progress").upsert({
        user_id: user.id,
        course_id: courseId,
        progress_percentage: Math.min(100, Math.max(0, progress)),
        completed_sections: completedSections,
        last_accessed: new Date().toISOString(),
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error updating course progress:", error)
      return false
    }
  }

  // Initialize method for compatibility
  async initialize(): Promise<void> {
    // No initialization needed for Supabase service
    return Promise.resolve()
  }
}

export const supabaseApiService = new SupabaseApiService()
