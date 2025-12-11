// services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from '../types';

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // 1. Get API Key from Environment Variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey || apiKey.includes("undefined") || apiKey.includes("PASTE_YOUR") || apiKey === "PLACEHOLDER_API_KEY") {
    throw new Error("API Key is missing or invalid. Please set VITE_GEMINI_API_KEY or VITE_GOOGLE_API_KEY in your environment variables.");
  }

  // 2. Initialize Client
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 3. List of models to try in order of preference
  const modelsToTry = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro"
  ];

  // 4. Define Response Schema
  const responseSchema = {
    type: "object",
    properties: {
      tripTitle: { type: "string", description: "A creative title for the trip" },
      greeting: { type: "string", description: "A personalized opening paragraph" },
      summary: { type: "string", description: "A 2-3 sentence overview of the trip" },
      totalEstimatedCost: { type: "string", description: "Estimated cost range in USD per person" },
      priceIncludes: { type: "array", items: { type: "string" }, description: "List of key inclusions" },
      highlights: { type: "array", items: { type: "string" } },
      days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "integer" },
            title: { type: "string" },
            activities: { type: "array", items: { type: "string" } },
            notes: { type: "string", description: "Evening recommendation or dining tip" }
          },
          required: ["day", "title", "activities"]
        }
      },
      accommodationOptions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string", description: "Hotel type" },
            description: { type: "string", description: "Hotel description" }
          },
          required: ["name", "type", "description"]
        }
      },
      travelTips: { type: "array", items: { type: "string" } }
    },
    required: ["tripTitle", "greeting", "summary", "totalEstimatedCost", "priceIncludes", "highlights", "days", "accommodationOptions", "travelTips"]
  };

  // 5. Build Prompt
  const selectedStyles = Array.isArray(formData.travelStyle) ? formData.travelStyle.join(", ") : formData.travelStyle;

  const prompt = `You are a senior luxury travel consultant for Mr & Mrs Egypt. Create a complete detailed ${formData.duration}-day itinerary for a client.

CLIENT DETAILS:
- Name: ${formData.name}
- Origin: ${formData.country}
- Dates: Starting ${formData.startDate} for ${formData.duration} days
- Trip Type: ${formData.tripType}
- Budget Level: ${formData.budgetRange}
- Primary Interest: ${selectedStyles}
- Party: ${formData.groupSize} people ${formData.hasChildren ? 'with children' : 'adults only'}
- Special Notes: ${formData.additionalNotes || "None"}

REQUIREMENTS:
1. Adapt tone to trip type (romantic for couples, family-friendly for families)
2. Include Cairo Pyramids and Grand Egyptian Museum, consider Luxor and Aswan for longer trips
3. Use domestic flights between Cairo and Upper Egypt cities
4. Provide realistic cost estimate based on budget level
5. Suggest 2-3 specific hotels matching budget
6. Structure each day with clear title, 3-6 activities with timing, and evening notes
7. Include 5-7 practical Egypt travel tips

Return a strict JSON object matching the schema.`;

  // 6. Try each model until one works
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
        }
      });

      const text = (await result.response).text();
      if (!text) {
        throw new Error("No response from AI");
      }

      const parsedResponse = JSON.parse(text) as ItineraryResponse;
      console.log(`Successfully generated itinerary using model: ${modelName}`);
      return parsedResponse;

    } catch (error: any) {
      const msg = error?.message || String(error);
      console.warn(`Model ${modelName} failed:`, msg);
      lastError = error;

      // Check if it's a quota error
      if (msg.includes("429") || msg.includes("quota") || msg.includes("Quota exceeded")) {
        // Continue to try next model instead of throwing immediately
        console.log(`Quota exceeded for ${modelName}, trying next model...`);
        continue;
      }

      // For other errors, also try next model
      console.log(`Error with ${modelName}, trying next model...`);
      continue;
    }
  }

  // 7. If all models failed, throw comprehensive error
  const lastErrorMsg = lastError?.message || String(lastError);
  
  if (lastErrorMsg.includes("429") || lastErrorMsg.includes("quota") || lastErrorMsg.includes("Quota exceeded")) {
    throw new Error(
      "Daily free quota reached for all available models. Your quota resets at 10 AM Cairo time (midnight Pacific). " +
      "To remove this limit permanently, enable billing in Google AI Studio at aistudio.google.com"
    );
  }

  throw new Error(
    `Failed to generate itinerary with all available models. Last error: ${lastErrorMsg}. ` +
    `Please check your API key or try again later.`
  );
};
