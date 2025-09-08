
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ErrorHandler } from "@/utils/errorHandler";
import { CacheService } from "./CacheService";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MODEL_NAME = "gemini-1.5-flash";
  private readonly MAX_TOKENS = 8192;
  private initialized = false;
  private cache: CacheService;
  private readonly API_KEY_SETTING = "gemini_api_key";

  constructor() {
    this.cache = CacheService.getInstance();
    this.initializeFromStorage();
  }

  private async initializeFromStorage(): Promise<void> {
    try {
      const apiKey = this.getApiKeyFromStorage();

      if (apiKey) {
        this.initialize(apiKey);
      } else {
        const envApiKey =
          typeof window !== "undefined"
            ? import.meta.env?.VITE_GEMINI_API_KEY
            : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (envApiKey) {
          this.initialize(envApiKey);
          await this.saveApiKey(envApiKey);
        } else {
          console.warn(
            "Gemini API key not found in local storage or environment variables"
          );
        }
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);

      const apiKey =
        typeof window !== "undefined"
          ? import.meta.env?.VITE_GEMINI_API_KEY
          : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        this.initialize(apiKey);
      } else {
        console.warn("Gemini API key not found in environment variables");
      }
    }
  }

  public initialize(apiKey: string): void {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.MODEL_NAME,
        generationConfig: {
          maxOutputTokens: this.MAX_TOKENS,
          temperature: 0.7,
        },
      });
      this.initialized = true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      this.initialized = false;
      throw appError;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw ErrorHandler.handle({
        code: "AUTH_ERROR",
        message:
          "Gemini service is not initialized. Please set a valid API key.",
      });
    }
  }

  private getApiKeyFromStorage(): string | null {
    try {
      if (typeof window === "undefined") {
        return null;
      }
      return localStorage.getItem(this.API_KEY_SETTING);
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return null;
    }
  }

  public async getApiKey(): Promise<string | null> {
    return this.getApiKeyFromStorage();
  }

  public async saveApiKey(apiKey: string): Promise<boolean> {
    try {
      if (typeof window === "undefined") {
        return false;
      }
      localStorage.setItem(this.API_KEY_SETTING, apiKey);
      this.initialize(apiKey);
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return false;
    }
  }

  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    const result = await fetchFn();
    this.cache.set(cacheKey, result);
    return result;
  }

  async generateCourseContent(courseName: string, courseTopic: string): Promise<any> {
    this.ensureInitialized();
    const cacheKey = CacheService.generateGeminiKey("courseContent", [
      courseName,
      courseTopic,
    ]);

    try {
      return await this.getCachedOrFetch(cacheKey, async () => {
        const prompt = `
          Generate a detailed, well-structured JSON object for a course titled "${courseName}" on the topic of "${courseTopic}".

          The JSON response must include the following fields:
          - "overview": A comprehensive summary of what the course covers, its goals, and who it's for.
          - "learning_objectives": An array of 5-7 key skills or knowledge points students will gain.
          - "key_topics": An array of 4-6 modules or sections, each with a "title" and a "description" that outlines what will be taught in that module.
          - "prerequisites": An array of 2-4 recommended skills or courses to take before starting this one.

          Example structure:
          {
            "overview": "This course provides a complete introduction to...",
            "learning_objectives": [
              "Understand the core principles of...",
              "Develop practical skills in...",
              ...
            ],
            "key_topics": [
              { "title": "Introduction to X", "description": "Learn the basics of..." },
              { "title": "Advanced Techniques in Y", "description": "Explore complex concepts like..." },
              ...
            ],
            "prerequisites": [
              "Basic understanding of...",
              "Familiarity with..."
            ]
          }

          Return only the raw JSON object, without any markdown formatting, code blocks, or extra text.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.tryParseJSON(response.text());
      });
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return {
        error: "Failed to generate content",
        message: appError.message,
      };
    }
  }
  private tryParseJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch (e) {
      try {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (e2) {
        const error = ErrorHandler.handle(e2);
        ErrorHandler.logError(error);
      }

      return { error: "Invalid response format", text };
    }
  }
}

export const geminiService = new GeminiService();
export const { generateCourseContent } = new GeminiService();
