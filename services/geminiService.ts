import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from "../types";

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // 1. Get API Key from Vercel Environment Variables
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey || apiKey.includes("undefined") || apiKey.includes("PASTE_YOUR") || apiKey === "PLACEHOLDER_API_KEY") {
    throw new Error("API Key is missing or invalid. Please set VITE_GOOGLE_API_KEY in Vercel environment variables.");
  }

  // 2. Initialize Client
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List of models to try in order of preference
  const modelsToTry = [
    "gemini-2.0-flash-001",
    "gemini-2.5-flash", 
    "gemini-2.0-flash",
    "gemini-1.5-pro"
  ];

  let lastError: any = null;

  // Try each model until one works
  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      
      // 3. Configure Model
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              tripTitle: { type: SchemaType.STRING },
              greeting: { type: SchemaType.STRING },
              summary: { type: SchemaType.STRING },
              totalEstimatedCost: { type: SchemaType.STRING },
              priceIncludes: { 
                type: SchemaType.ARRAY, 
                items: { type: SchemaType.STRING }
              },
              highlights: { 
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              },
              days: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    day: { type: SchemaType.INTEGER },
                    title: { type: SchemaType.STRING },
                    activities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    notes: { type: SchemaType.STRING }
                  },
                  required: ["day", "title", "activities"]
                }
              },
              accommodationOptions: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING }
                  }
                }
              },
              travelTips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["tripTitle", "greeting", "summary", "totalEstimatedCost", "priceIncludes", "highlights", "days", "accommodationOptions", "travelTips"]
          }
        }
      });

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
        1. Tone: Sophisticated, professional, adapted to trip type.
        2. Structure: Day-by-day breakdown with specific sites.
        3. Hotels: Suggest 2-3 specific options.
        4. Grand Egyptian Museum (GEM): Must be included as fully open.
        5. Inclusions: Private Transport, Guide, Entry Tickets. Domestic Flights (Cairo-Luxor/Aswan ONLY).
        6. Exclusions: International flights, tips.

        Return a strict JSON object matching the requested schema.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("No response from AI");
      }
      
      console.log(`Success with model: ${modelName}`);
      return JSON.parse(text) as ItineraryResponse;

    } catch (error: any) {
      console.error(`Error with model ${modelName}:`, error?.message || error);
      lastError = error;
      
      // If it's not a 404 error, don't try other models
      if (!error?.message?.includes("404") && !error?.message?.includes("not found")) {
        throw error;
      }
      
      // Continue to next model if this one failed with 404
      continue;
    }
  }

  // If we got here, all models failed
  throw new Error(
    `Failed to generate itinerary with all available models. Last error: ${lastError?.message || "Unknown error"}. ` +
    `Please verify your API key is valid and has access to Gemini models.`
  );
};
