import { GoogleGenerativeAI } from "@google/generative-ai"

export interface CourseContent {
  overview: string
  syllabus: string[]
  keyTopics: { title: string; description: string }[]
  learningObjectives: string[]
  recommendedReadings: { title: string; url?: string }[]
}

export interface StudyMaterial {
  content: string
  summary: string
  keyPoints: string[]
  practiceQuestions: { question: string; answer: string }[]
}

export interface ResearchResult {
  overview: string
  keyFindings: string[]
  sources: string[]
  relatedTopics: string[]
}

export class GeminiService {
  private static API_KEY =
    typeof window !== "undefined"
      ? import.meta.env?.VITE_GEMINI_API_KEY || "AIzaSyCub1GCnJQnHv6PoSofZ2t6UNDhPKEPWJM"
      : process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCub1GCnJQnHv6PoSofZ2t6UNDhPKEPWJM"
  private static geminiClient: GoogleGenerativeAI | null = null
  private static MODEL_NAME = "gemini-2.0-flash"

  static saveApiKey(apiKey: string): void {
    this.API_KEY = apiKey
    this.geminiClient = new GoogleGenerativeAI(apiKey)
    console.log("Gemini API key saved")
  }

  static getApiKey(): string {
    return this.API_KEY
  }

  private static getClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      this.geminiClient = new GoogleGenerativeAI(this.API_KEY)
    }
    return this.geminiClient
  }

  static async generateCourseContent(
    courseName: string,
    description: string,
    difficulty: string,
  ): Promise<CourseContent> {
    const client = this.getClient()
    const model = client.getGenerativeModel({ model: this.MODEL_NAME })

    const prompt = `Generate a comprehensive course content for:
    Course: ${courseName}
    Description: ${description}
    Difficulty Level: ${difficulty}

    Please provide:
    1. A brief overview
    2. A detailed syllabus (10-15 points)
    3. Key topics with descriptions (5-7 topics)
    4. Learning objectives (5-7 objectives)
    5. Recommended readings (3-5 sources)

    Format the response in a structured way that can be parsed into sections.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      // Parse the content into structured format
      // This is a simplified parsing - you might want to make it more robust
      const sections = content.split("\n\n")

      return {
        overview: sections[0],
        syllabus: sections[1].split("\n").filter((item) => item.trim()),
        keyTopics: sections[2]
          .split("\n")
          .filter((item) => item.trim())
          .map((topic) => {
            const [title, ...desc] = topic.split(":")
            return {
              title: title.trim(),
              description: desc.join(":").trim(),
            }
          }),
        learningObjectives: sections[3].split("\n").filter((item) => item.trim()),
        recommendedReadings: sections[4]
          .split("\n")
          .filter((item) => item.trim())
          .map((reading) => ({ title: reading })),
      }
    } catch (error) {
      console.error("Error generating course content:", error)
      throw error
    }
  }

  static async generateStudyMaterial(topic: string, context?: string): Promise<StudyMaterial> {
    const client = this.getClient()
    const model = client.getGenerativeModel({ model: this.MODEL_NAME })

    const prompt = `Create comprehensive study material for:
    Topic: ${topic}
    ${context ? `Context: ${context}` : ""}

    Please provide:
    1. Detailed content explanation
    2. A brief summary
    3. Key points to remember (5-7 points)
    4. Practice questions with answers (3-5 questions)

    Format the response in a structured way that can be parsed into sections.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      const sections = content.split("\n\n")

      return {
        content: sections[0],
        summary: sections[1],
        keyPoints: sections[2].split("\n").filter((item) => item.trim()),
        practiceQuestions: sections[3]
          .split("\n")
          .filter((item) => item.trim())
          .map((qa) => {
            const [question, answer] = qa.split("Answer:")
            return {
              question: question.replace("Question:", "").trim(),
              answer: answer ? answer.trim() : "",
            }
          }),
      }
    } catch (error) {
      console.error("Error generating study material:", error)
      throw error
    }
  }

  static async getResearchAssistance(topic: string): Promise<ResearchResult> {
    const client = this.getClient()
    const model = client.getGenerativeModel({ model: this.MODEL_NAME })

    const prompt = `Conduct a research analysis on: ${topic}

    Please provide:
    1. A comprehensive overview
    2. Key findings and insights (5-7 points)
    3. Relevant sources or references
    4. Related topics for further research

    Format the response in a structured way that can be parsed into sections.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      const sections = content.split("\n\n")

      return {
        overview: sections[0],
        keyFindings: sections[1].split("\n").filter((item) => item.trim()),
        sources: sections[2].split("\n").filter((item) => item.trim()),
        relatedTopics: sections[3].split("\n").filter((item) => item.trim()),
      }
    } catch (error) {
      console.error("Error with research assistance:", error)
      throw error
    }
  }

  static async generateQuizQuestions(
    topic: string,
    difficulty: string,
    numberOfQuestions = 5,
  ): Promise<Array<{ question: string; options: string[]; correctAnswer: string }>> {
    const client = this.getClient()
    const model = client.getGenerativeModel({ model: this.MODEL_NAME })

    const prompt = `Generate ${numberOfQuestions} multiple-choice questions about ${topic} at ${difficulty} level.
    For each question, provide:
    1. The question
    2. Four options (A, B, C, D)
    3. The correct answer

    Format each question in a structured way that can be parsed.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      // Parse the content into questions
      return content
        .split("\n\n")
        .filter((item) => item.trim())
        .map((questionBlock) => {
          const lines = questionBlock.split("\n")
          const question = lines[0].replace(/^\d+\.\s*/, "")
          const options = lines.slice(1, 5).map((opt) => opt.replace(/^[A-D]\)\s*/, ""))
          const correctAnswer = lines[5].replace("Correct Answer: ", "")

          return {
            question,
            options,
            correctAnswer,
          }
        })
    } catch (error) {
      console.error("Error generating quiz questions:", error)
      throw error
    }
  }
}
