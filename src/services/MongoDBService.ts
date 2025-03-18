import mongoose from 'mongoose';
import { ErrorHandler } from '@/utils/errorHandler';
import * as CryptoJS from 'crypto-js';

// MongoDB Connection URI
const MONGODB_URI = 'mongodb+srv://mitchtembo:SNCrO8MK3FhBPJhm@learn.opdzi.mongodb.net/?retryWrites=true&w=majority&appName=learn';

// Define MongoDB schemas
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  progress: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  studentsEnrolled: { type: Number, default: 0 },
  content: { type: mongoose.Schema.Types.Mixed },
  studyMaterials: [{ type: mongoose.Schema.Types.Mixed }],
  quizzes: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  courseId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  encrypted: { type: Boolean, default: false }
});

// Define MongoDB models
const CourseModel = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const NoteModel = mongoose.models.Note || mongoose.model('Note', NoteSchema);
const SettingModel = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

// List of keys that should be encrypted
const SENSITIVE_KEYS = ['gemini_api_key'];

// Encryption secret key - in production this would be set securely via environment variables
const ENCRYPTION_KEY = 'l34rnw4r3-gr0v3-s3cr3t-k3y';

class MongoDBService {
  private static instance: MongoDBService;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    // Connect when instance is created
    this.connectionPromise = this.connect();
  }

  static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  private async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      this.isConnected = true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      this.isConnected = false;
      throw appError;
    }
  }

  async ensureConnected(): Promise<void> {
    if (!this.isConnected && this.connectionPromise) {
      await this.connectionPromise;
    }

    if (!this.isConnected) {
      throw ErrorHandler.handle({
        code: 'DB_ERROR',
        message: 'Not connected to MongoDB'
      });
    }
  }

  // Private helper methods for encryption
  private encryptValue(value: string): string {
    return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
  }

  private decryptValue(encryptedValue: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private shouldEncrypt(key: string): boolean {
    return SENSITIVE_KEYS.includes(key);
  }

  // Course operations
  async getAllCourses() {
    await this.ensureConnected();
    try {
      return await CourseModel.find().lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async getCourseById(id: string) {
    await this.ensureConnected();
    try {
      return await CourseModel.findById(id).lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async createCourse(courseData: any) {
    await this.ensureConnected();
    try {
      const course = new CourseModel(courseData);
      await course.save();
      return course.toObject();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async updateCourse(id: string, courseData: any) {
    await this.ensureConnected();
    try {
      return await CourseModel.findByIdAndUpdate(
        id, 
        { ...courseData, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      ).lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async deleteCourse(id: string) {
    await this.ensureConnected();
    try {
      const result = await CourseModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  // Note operations
  async getAllNotes() {
    await this.ensureConnected();
    try {
      return await NoteModel.find().lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async getNoteById(id: string) {
    await this.ensureConnected();
    try {
      return await NoteModel.findById(id).lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async getNotesByCourse(courseId: string) {
    await this.ensureConnected();
    try {
      return await NoteModel.find({ courseId }).lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async createNote(noteData: any) {
    await this.ensureConnected();
    try {
      const note = new NoteModel(noteData);
      await note.save();
      return note.toObject();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async updateNote(id: string, noteData: any) {
    await this.ensureConnected();
    try {
      return await NoteModel.findByIdAndUpdate(
        id, 
        { ...noteData, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      ).lean();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async deleteNote(id: string) {
    await this.ensureConnected();
    try {
      const result = await NoteModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  // Settings operations with encryption support
  async getSetting(key: string) {
    await this.ensureConnected();
    try {
      const setting = await SettingModel.findOne({ key }).lean();
      
      if (!setting) return null;
      
      // If the setting is encrypted, decrypt it
      if (setting.encrypted && typeof setting.value === 'string') {
        return this.decryptValue(setting.value);
      }
      
      return setting.value;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  async setSetting(key: string, value: any) {
    await this.ensureConnected();
    try {
      let valueToStore = value;
      let encrypted = false;
      
      // Check if this key should be encrypted and is a string
      if (this.shouldEncrypt(key) && typeof value === 'string') {
        valueToStore = this.encryptValue(value);
        encrypted = true;
      }
      
      await SettingModel.updateOne(
        { key }, 
        { key, value: valueToStore, encrypted }, 
        { upsert: true }
      );
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }

  // Migration helper
  async migrateFromLocal(localData: {courses?: any[], notes?: any[]}) {
    await this.ensureConnected();
    try {
      if (localData.courses && localData.courses.length > 0) {
        // Check if courses already exist in MongoDB
        const existingCourses = await CourseModel.countDocuments();
        if (existingCourses === 0) {
          // Convert _id to MongoDB ObjectId for courses
          for (const course of localData.courses) {
            await this.createCourse(course);
          }
          console.log(`Migrated ${localData.courses.length} courses`);
        }
      }

      if (localData.notes && localData.notes.length > 0) {
        // Check if notes already exist in MongoDB
        const existingNotes = await NoteModel.countDocuments();
        if (existingNotes === 0) {
          // Convert _id to MongoDB ObjectId for notes
          for (const note of localData.notes) {
            await this.createNote(note);
          }
          console.log(`Migrated ${localData.notes.length} notes`);
        }
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }
}

export const mongoDBService = MongoDBService.getInstance(); 