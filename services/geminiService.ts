import { GoogleGenAI, Type } from "@google/genai";

// NOTE: In a real environment, allow the user to input their key or use a proxy.
// For this demo, we assume process.env.API_KEY is available or handle the failure gracefully.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const suggestBookDetails = async (title: string, author?: string) => {
  if (!apiKey) {
    throw new Error("La clave de la API de Gemini no está configurada.");
  }

  try {
    const model = 'gemini-2.5-flash';
    // Adjusting the prompt to include author only if provided
    const prompt = `Provide details for the book "${title}"${author ? ` by "${author}"` : ''}. Return JSON including title, author, genre, totalPages, year, and a short summary.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the book" },
            author: { type: Type.STRING, description: "Author of the book" }, // Added author to schema
            genre: { type: Type.STRING, description: "Best matching genre from: Ficción, No Ficción, Romance, Thriller, Historia, Biografía, Fantasía, Ciencia Ficción, Clásicos, Autoayuda" },
            totalPages: { type: Type.INTEGER, description: "Estimated page count" },
            year: { type: Type.INTEGER, description: "Year of publication" },
            summary: { type: Type.STRING, description: "A very short 2 sentence summary in Spanish." }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Error al conectar con la IA: ${error.message || JSON.stringify(error)}`);
  }
};