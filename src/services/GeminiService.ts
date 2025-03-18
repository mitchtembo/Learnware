import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MODEL_NAME = "gemini-2.0-flash";
  private readonly MAX_TOKENS = 8192;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: this.MODEL_NAME,
      generationConfig: {
        maxOutputTokens: this.MAX_TOKENS,
        temperature: 0.7
      }
    });
  }

  private tryParseJSON(text: string): any {
    try {
      // Try to parse the text directly
      return JSON.parse(text);
    } catch (e) {
      try {
        // Look for JSON-like content in the text
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (e2) {
        console.error("Failed to parse JSON content:", e2);
      }
      
      return { error: "Invalid response format", text };
    }
  }

  async generateCourseDescription(courseTitle: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error("Error generating course description:", error);
      return "Failed to generate course description. Please try again or enter your own description.";
    }
  }

  async generateCourseContent(topic: string, description?: string): Promise<any> {
    try {
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
        }
        
        Important: Return ONLY the JSON with no additional text, markdown formatting, or code blocks.
        Ensure all JSON fields are properly formatted with quotes around string values and commas between elements.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.tryParseJSON(text);
    } catch (error) {
      console.error("Error generating course content:", error);
      return { error: "Failed to generate content", message: error.message };
    }
  }

  async generateStudyMaterial(topic: string, concept: string): Promise<any> {
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
}

export const geminiService = new GeminiService(); 