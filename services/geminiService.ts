import { GoogleGenAI, Type } from "@google/genai";
import { TravelFormData, ItineraryResponse } from "../types";

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // --- VITE FIX START ---
  // Vite uses import.meta.env, NOT process.env
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  // Debugging: Check console (F12) to see if key is loaded
  console.log("DEBUG: API Key Check:", { 
    exists: !!apiKey, 
    firstChar: apiKey ? apiKey[0] : 'N/A' 
  });

  if (!apiKey || apiKey.includes("undefined")) {
    throw new Error("API Key is missing. Please check Vercel Env Vars: VITE_GOOGLE_API_KEY");
  }
  // --- VITE FIX END ---

  // 2. Initialize Client
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Use a stable model version
  const model = "gemini-1.5-flash"; 

  const prompt = `
    You are a senior luxury travel consultant for "Mr & Mrs Egypt". 
    Create a complete, detailed ${formData.duration}-day itinerary for a client.

    Client Details:
    - Name: ${formData.name}
    - Origin: ${formData.country}
    - Dates: Starting ${formData.startDate} for ${formData.duration} days
    - Trip Type: ${formData.tripType}
    - Budget Level: ${formData.budgetRange}
    - Primary Interest/Style: ${formData.travelStyle}
    - Party: ${formData.groupSize} people ${formData.hasChildren ? '(includes children)' : '(adults only)'}
    - Special Notes: ${formData.additionalNotes || "None"}

    Requirements:
    1. Tone: Sophisticated, professional, adapted to trip type (${formData.tripType}).
    2. Structure: Day-by-day breakdown with specific sites.
    3. Hotels: Suggest 2-3 specific options matching budget.
    4. Grand Egyptian Museum (GEM): Must be included as fully open.
    5. Inclusions: Private Transport, Guide, Entry Tickets. Domestic Flights (Cairo-Luxor/Aswan ONLY).
    6. Exclusions: International flights, tips.

    Return a strict JSON object matching the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { type: Type.STRING },
            greeting: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalEstimatedCost: { type: Type.STRING },
            priceIncludes: { type: Type.ARRAY, items: { type: Type.STRING } },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notes: { type: Type.STRING }
                },
                required: ["day", "title", "activities"]
              }
            },
            accommodationOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "type", "description"]
              }
            },
            travelTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["tripTitle", "greeting", "summary", "totalEstimatedCost", "priceIncludes", "highlights", "days", "accommodationOptions", "travelTips"]
        }
      }
    });

    // Handle response text based on SDK version
    const text = typeof response.text === 'function' ? response.text() : response.text;
    
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ItineraryResponse;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    if (error instanceof Error) throw error;
    throw new Error("Unable to generate itinerary.");
  }
};
