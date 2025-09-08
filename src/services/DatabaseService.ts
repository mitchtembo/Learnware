import { Course, Note } from './DataService';
import { ErrorHandler } from '@/utils/errorHandler';

export interface DBSchema {
  courses: Course[];
  notes: Note[];
  settings: Record<string, any>;
}

class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'learnware_db';
  private readonly DB_VERSION = 1;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Initialize the database when the service is created
    this.initPromise = this.initDatabase();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: 'Failed to open database',
          details: event
        });
        ErrorHandler.logError(error);
        this.isInitialized = false;
        reject(error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async ensureInitialized(): Promise<void> {
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.db) {
      throw ErrorHandler.handle({
        code: 'DB_ERROR',
        message: 'Database is not initialized'
      });
    }
  }

  // Generic methods for data access
  async getAll<T>(storeName: keyof DBSchema): Promise<T[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName as string);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: `Failed to get items from ${storeName}`,
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  async getById<T>(storeName: keyof DBSchema, id: string): Promise<T | undefined> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName as string);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as T);
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: `Failed to get item from ${storeName}`,
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  async add<T extends { id: string }>(storeName: keyof DBSchema, item: T): Promise<T> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName as string);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: `Failed to add item to ${storeName}`,
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  async update<T extends { id: string }>(storeName: keyof DBSchema, item: T): Promise<T> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName as string);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: `Failed to update item in ${storeName}`,
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  async delete(storeName: keyof DBSchema, id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName as string);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: `Failed to delete item from ${storeName}`,
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  // Settings specific methods
  async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value as T);
        } else {
          resolve(defaultValue);
        }
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: 'Failed to get setting',
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        const error = ErrorHandler.handle({
          code: 'DB_ERROR',
          message: 'Failed to set setting',
          details: event
        });
        ErrorHandler.logError(error);
        reject(error);
      };
    });
  }

  // Helper method to clear all data (useful for testing or reset functionality)
  async clearDatabase(): Promise<void> {
    await this.ensureInitialized();
    
    const storeNames: (keyof DBSchema)[] = ['courses', 'notes', 'settings'];
    
    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName as string);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          const error = ErrorHandler.handle({
            code: 'DB_ERROR',
            message: `Failed to clear ${storeName}`,
            details: event
          });
          ErrorHandler.logError(error);
          reject(error);
        };
      });
    }
  }

  // Migration helper to move data from localStorage to IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Migrate courses
      const coursesJson = localStorage.getItem('learnware_courses');
      if (coursesJson) {
        const courses = JSON.parse(coursesJson);
        for (const course of courses) {
          await this.update('courses', {
            ...course,
            startDate: new Date(course.startDate),
            endDate: new Date(course.endDate),
            createdAt: new Date(course.createdAt),
            updatedAt: new Date(course.updatedAt)
          });
        }
      }

      // Migrate notes
      const notesJson = localStorage.getItem('learnware_notes');
      if (notesJson) {
        const notes = JSON.parse(notesJson);
        for (const note of notes) {
          await this.update('notes', {
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          });
        }
      }

      // Set a flag to indicate migration is complete
      await this.setSetting('migrationComplete', true);
      
      // Optionally clear localStorage after successful migration
      localStorage.removeItem('learnware_courses');
      localStorage.removeItem('learnware_notes');
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
