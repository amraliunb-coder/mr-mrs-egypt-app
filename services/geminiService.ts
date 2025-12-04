// geminiService.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from "../types";

export const generateItineraryPreview = async (
  formData: TravelFormData
): Promise<ItineraryResponse> => {

  // 1. Load API Key
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey || apiKey.includes("undefined")) {
    throw new Error(
      "API Key missing. Set VITE_GOOGLE_API_KEY in Vercel → Environment Variables."
    );
  }

  // 2. Initialize Gemini Client
  const genAI = new GoogleGenerativeAI(apiKey);

  // 3. Use Latest Stable Model
 const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: { ... }
  }
});

      // 🚀 STRUCTURED OUTPUT SCHEMA
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
                activities: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING }
                },
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
              },
              required: ["name", "type", "description"]
            }
          },

          travelTips: {
            type: SchemaType.ARRAY,
            items: { type: Sc
