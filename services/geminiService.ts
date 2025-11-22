import { GoogleGenAI, Type } from "@google/genai";
import { showError } from '../src/utils/toast'; // Import showError utility

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Helper to extract a more user-friendly error message
const getErrorMessage = (error: any): string => {
  if (!error) return 'Error desconocido de la IA.';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  // Check for common API error structures
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error.message;
  }
  return JSON.stringify(error);
};

export const suggestBookDetails = async (title: string, author?: string) => {
  // This check is also in BookForm, but good to have here for robustness
  if (!apiKey) {
    showError("La clave de la API de Gemini no está configurada en el servicio. Consulta el README.md.");
    return null;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide details for the book "${title}"${author ? ` by "${author}"` : ''}. Return JSON.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre: { type: Type.STRING, description: "Best matching genre from: Ficción, No Ficción, Romance, Thriller, Historia, Biografía, Fantasía, Ciencia Ficción, Clásicos, Autoayuda" },
            totalPages: { type: Type.INTEGER, description: "Estimated page count" },
            year: { type: Type.INTEGER, description: "Year of publication" },
            summary: { type: Type.STRING, description: "A very short 2 sentence summary in Spanish." }
          }
        }
      }
    });

    // Check if the response text is empty or null
    if (!response.text) {
        showError("La IA no devolvió ninguna sugerencia. Inténtalo con otro título o revisa la clave API.");
        return null;
    }
    
    try {
        return JSON.parse(response.text);
    } catch (jsonError) {
        console.error("Error al analizar la respuesta de la API de Gemini:", jsonError, "Texto de respuesta:", response.text);
        showError("Error al procesar la respuesta de la IA. El formato no es válido.");
        return null;
    }

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Gemini API Error:", error);
    showError(`Error de la IA: ${errorMessage}. Asegúrate de que tu clave API sea válida y que el servicio esté disponible.`);
    return null;
  }
};