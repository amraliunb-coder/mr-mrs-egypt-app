// geminiService.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from "../types";

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // --- TEMPORARY DEBUGGING ---
  // 1. Paste your "AIza..." key directly here inside the quotes.
  const apiKey = "AIzaSy_PASTE_YOUR_NEW_KEY_HERE"; 
  
  // 2. Initialize
  const genAI = new GoogleGenerativeAI(apiKey);

  // 3. Use the KNOWN working model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Do not use 2.0 yet
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        // ... (keep your existing schema properties here) ...
        properties: {
          tripTitle: { type: SchemaType.STRING },
          greeting: { type: SchemaType.STRING },
          summary: { type: SchemaType.STRING },
          totalEstimatedCost: { type: SchemaType.STRING },
          priceIncludes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          highlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
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

  // ... (keep the prompt and response handling code) ...
  const prompt = `Create a ${formData.duration}-day trip to Egypt...`; // (Keep your full prompt)

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return JSON.parse(text) as ItineraryResponse;
};
