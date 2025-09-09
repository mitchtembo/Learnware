
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
          - "key_topics": An array of 4-6 modules or sections, each with a "title" and a "description".
          - "prerequisites": An array of 2-4 recommended skills or courses.
          - "study_materials": An array of 3-5 relevant articles, videos, or books, each with a "title" and a "url".
          - "quizzes": An array of 2-3 quizzes, each covering a "topic" and containing an array of "questions". Each question should have "question_text", an array of "options", and an "answer".

          Example structure:
          {
            "overview": "This course provides a complete introduction to...",
            "learning_objectives": [
              "Understand the core principles of...",
              "Develop practical skills in..."
            ],
            "key_topics": [
              { "title": "Introduction to X", "description": "Learn the basics of..." },
              { "title": "Advanced Techniques in Y", "description": "Explore complex concepts like..." }
            ],
            "prerequisites": [
              "Basic understanding of...",
              "Familiarity with..."
            ],
            "study_materials": [
              { "title": "Introductory Article", "url": "https://example.com/article" },
              { "title": "Deep Dive Video", "url": "https://youtube.com/watch?v=123" }
            ],
            "quizzes": [
              {
                "topic": "Fundamentals of X",
                "questions": [
                  {
                    "question_text": "What is the primary benefit of X?",
                    "options": ["Benefit A", "Benefit B", "Benefit C"],
                    "answer": "Benefit A"
                  }
                ]
              }
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

  async generateCourseDescription(courseName: string): Promise<string> {
    this.ensureInitialized();
    const cacheKey = CacheService.generateGeminiKey("courseDescription", [courseName]);

    try {
      return await this.getCachedOrFetch(cacheKey, async () => {
        const prompt = `
          Generate a concise, engaging, one-paragraph course description for a course titled "${courseName}".
          The description should be around 2-3 sentences long.
          Return only the raw text of the description, without any markdown or extra formatting.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return "Failed to generate description.";
    }
  }
}

export const geminiService = new GeminiService();

// Provide a safe, bound helper that accepts either (courseName, courseTopic)
// or a course object (as the page currently passes the whole course).
export const generateCourseContent = (
  courseOrName: any,
  courseTopic?: string
): Promise<any> => {
  if (typeof courseOrName === "object" && courseOrName !== null) {
    const name = courseOrName.name || courseOrName.title || "";
    const topic = courseOrName.topic || courseOrName.subject || "";
    return geminiService.generateCourseContent(name, topic);
  }

  return geminiService.generateCourseContent(courseOrName, courseTopic || "");
};
