
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';

// IMPORTANT: API key is sourced from environment variables.
// Ensure process.env.API_KEY is available in your execution environment.
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

export const enhanceTextWithGemini = async (originalText: string, promptType: 'staking' | 'coaching'): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API client not initialized. API key might be missing.");
  }
  if (!originalText.trim()) {
    return ""; // Don't call API for empty text
  }

  const basePrompt = "You are an expert copywriter for a poker marketplace. Enhance the following listing description to be more appealing, professional, and clear for potential buyers/students. Highlight key benefits and unique selling points. Ensure the tone is engaging and trustworthy. Keep it concise but informative. Do not add any conversational intro or outro, just provide the improved description text.";
  
  let specificInstruction = "";
  if (promptType === 'staking') {
    specificInstruction = "Focus on what a backer would want to know: player's confidence, tournament significance, potential ROI, and reporting transparency.";
  } else if (promptType === 'coaching') {
    specificInstruction = "Focus on what a student would gain: skills improvement, results-oriented coaching, unique teaching methods, and value for money.";
  }

  const fullPrompt = `${basePrompt}\n${specificInstruction}\n\nOriginal description:\n\`\`\`\n${originalText}\n\`\`\`\n\nEnhanced description:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: fullPrompt,
        // No thinkingConfig needed for this use case, default is fine.
    });
    
    // The `.text` accessor directly provides the generated text.
    const enhancedText = response.text;
    
    if (enhancedText) {
      return enhancedText.trim();
    } else {
      throw new Error("Received an empty response from Gemini API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Failed to enhance text using AI. Please try again later.";
    if (error instanceof Error) {
        errorMessage = `Gemini API Error: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};
