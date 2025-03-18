
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';
  private static geminiClient: GoogleGenerativeAI | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.geminiClient = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API key saved');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async getResearchAssistance(topic: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }

    if (!this.geminiClient) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Please provide a detailed research overview on the following topic: ${topic}. 
                     Include key points, potential research directions, and relevant academic areas to explore.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error with Gemini API:', error);
      throw error;
    }
  }
}
