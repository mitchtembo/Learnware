import { Course } from "./DataService";

export interface ApiService {
  getCourses(): Promise<Course[]>;
  createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Course>;
}
