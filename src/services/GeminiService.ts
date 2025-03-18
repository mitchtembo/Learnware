import { GoogleGenerativeAI } from "@google/generative-ai";
import { ErrorHandler } from "@/utils/errorHandler";
import { CacheService } from "./CacheService";
import { mongoDBService } from "./MongoDBService";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MODEL_NAME = "gemini-2.0-flash";
  private readonly MAX_TOKENS = 8192;
  private initialized: boolean = false;
  private cache: CacheService;
  private readonly API_KEY_SETTING = "gemini_api_key";

  constructor() {
    this.cache = CacheService.getInstance();
    this.initializeFromDB();
  }

  private async initializeFromDB(): Promise<void> {
    try {
      const apiKey = await mongoDBService.getSetting(this.API_KEY_SETTING);
      
      if (apiKey) {
        this.initialize(apiKey);
      } else {
        const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (envApiKey) {
          this.initialize(envApiKey);
          // Save the environment key to DB for future use
          await this.saveApiKey(envApiKey);
        } else {
          console.warn("Gemini API key not found in database or environment variables");
        }
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      
      // Fall back to environment variable if DB fails
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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
          temperature: 0.7
        }
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
        code: 'AUTH_ERROR',
        message: "Gemini service is not initialized. Please set a valid API key."
      });
    }
  }

  public async getApiKey(): Promise<string | null> {
    try {
      return await mongoDBService.getSetting(this.API_KEY_SETTING);
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return null;
    }
  }

  public async saveApiKey(apiKey: string): Promise<boolean> {
    try {
      await mongoDBService.setSetting(this.API_KEY_SETTING, apiKey);
      this.initialize(apiKey);
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return false;
    }
  }

  private async getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    const result = await fetchFn();
    this.cache.set(cacheKey, result);
    return result;
  }

  async generateCourseDescription(courseTitle: string): Promise<string> {
    this.ensureInitialized();
    const cacheKey = CacheService.generateGeminiKey('courseDescription', [courseTitle]);

    try {
      return await this.getCachedOrFetch(cacheKey, async () => {
        const prompt = `Generate a comprehensive and engaging course description for a course titled: "${courseTitle}".
        
        The description should be 3-5 sentences long and should:
        1. Explain what the course covers
        2. Mention key skills or knowledge students will gain
        3. Be appropriate for an educational setting
        4. Be professionally written but engaging
        
        Return ONLY the description text with no additional formatting or labels.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      });
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return "Failed to generate course description. Please try again or enter your own description.";
    }
  }

  async generateCourseContent(topic: string, description?: string): Promise<any> {
    this.ensureInitialized();
    const cacheKey = CacheService.generateGeminiKey('courseContent', [topic, description]);

    try {
      return await this.getCachedOrFetch(cacheKey, async () => {
        const prompt = `Generate a comprehensive course outline and introduction for: ${topic}.
          ${description ? `Additional context: ${description}` : ''}
          
          I need the response to be formatted as a valid, well-structured JSON object.
          
          The JSON response should have the following structure:
          {
            "courseTitle": "${topic}",
            "courseDescription": "Detailed description of the course",
            "overview": "Brief overview of the course",
            "learningObjectives": ["objective1", "objective2", ...],
            "keyTopics": [{"title": "Topic title", "description": "Topic description"}, ...],
            "prerequisites": ["prerequisite1", "prerequisite2", ...],
            "estimatedTimeHours": number
          }`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.tryParseJSON(response.text());
      });
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      return { error: "Failed to generate content", message: appError.message };
    }
  }

  async generateStudyMaterial(topic: string, concept: string): Promise<any> {
    this.ensureInitialized();
    try {
      const prompt = `Create detailed study material for the concept "${concept}" in the topic "${topic}".
        
        I need the response to be formatted as a valid, well-structured JSON object.
        
        The JSON response should have the following structure:
        {
          "title": "${concept}",
          "content": "Detailed explanation of the concept",
          "summary": "Brief summary",
          "keyPoints": ["point1", "point2", ...],
          "examples": ["example1", "example2", ...],
          "practiceQuestions": [
            {"question": "Question text", "answer": "Answer text"}, 
            ...
          ]
        }
        
        Important: Return ONLY the JSON with no additional text, markdown formatting, or code blocks.
        Ensure all JSON fields are properly formatted with quotes around string values and commas between elements.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.tryParseJSON(text);
    } catch (error) {
      console.error("Error generating study material:", error);
      return { error: "Failed to generate study material", message: error.message };
    }
  }

  async generateQuizQuestions(topic: string): Promise<any> {
    this.ensureInitialized();
    try {
      const prompt = `Generate 5 quiz questions with answers for the topic: ${topic}.
        
        I need the response to be formatted as a valid, well-structured JSON object.
        
        The JSON response should have the following structure:
        {
          "topic": "${topic}",
          "questions": [
            {
              "question": "Question text",
              "options": ["option1", "option2", "option3", "option4"],
              "correctAnswer": "Correct option text",
              "explanation": "Explanation of the correct answer"
            },
            ...
          ]
        }
        
        Important: Return ONLY the JSON with no additional text, markdown formatting, or code blocks.
        Ensure all JSON fields are properly formatted with quotes around string values and commas between elements.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.tryParseJSON(text);
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      return { error: "Failed to generate quiz questions", message: error.message };
    }
  }

  async getResearchAssistance(query: string): Promise<any> {
    this.ensureInitialized();
    try {
      const prompt = `Provide research assistance for the following query: ${query}
        
        I need the response to be formatted as a valid, well-structured JSON object.
        
        The JSON response should have the following structure:
        {
          "query": "${query}",
          "overview": "Overview of the research topic",
          "keyFindings": ["finding1", "finding2", ...],
          "relevantConcepts": ["concept1", "concept2", ...],
          "suggestedResources": [
            {"title": "Resource title", "url": "URL if available", "description": "Brief description"},
            ...
          ],
          "furtherExploration": ["area1", "area2", ...]
        }
        
        Important: Return ONLY the JSON with no additional text, markdown formatting, or code blocks.
        Ensure all JSON fields are properly formatted with quotes around string values and commas between elements.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.tryParseJSON(text);
    } catch (error) {
      console.error("Error getting research assistance:", error);
      return { error: "Failed to get research assistance", message: error.message };
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