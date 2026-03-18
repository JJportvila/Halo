import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function translateText(text: string, fromLang: string, toLang: string): Promise<string> {
  if (!apiKey) {
    console.error("Gemini API key is missing.");
    return `[Translation Error: API Key Missing] ${text}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text from ${fromLang} to ${toLang}. Only return the translated text without any explanations or extra characters.\n\nText: ${text}`,
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation error:", error);
    return `[Translation Error] ${text}`;
  }
}
