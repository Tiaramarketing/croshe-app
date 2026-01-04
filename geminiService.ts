import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserPreferences } from "./types";

export class GeminiService {
  private static getAi() {
    // This connects to the API Key you provide during deployment
    return new GoogleGenerativeAI(process.env.API_KEY || '');
  }

  static async generatePlushiePreview(imageBase64: string): Promise<string> {
    const genAI = this.getAi();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    await model.generateContent([
      { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
      { text: "Analyze this image for a crochet pattern." }
    ]);

    return `data:image/jpeg;base64,${imageBase64}`;
  }

  static async generatePattern(
    originalImageBase64: string, 
    plushieImageBase64: string, 
    prefs: UserPreferences
  ): Promise<string> {
    const genAI = this.getAi();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent([
      { inlineData: { data: originalImageBase64, mimeType: "image/jpeg" } },
      { text: `Generate a crochet pattern for ${prefs.skillLevel}.` }
    ]);

    const response = await result.response;
    return response.text();
  }
}