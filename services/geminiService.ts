// geminiService.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from "../types";

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // 1. Get Key
 const apiKey = "AIzaSyAfRe3HcUQQiLMPU7_n1LJXpfrV_Jvll8o";

  if (!apiKey || apiKey.includes("undefined")) {
    throw new Error("API Key is missing. Please check Vercel Env Vars: VITE_GOOGLE_API_KEY");
  }

  // 2. Initialize Client (Standard Web SDK)
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 3. Configure Model
  // This SDK handles the API versions automatically for you
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-001", 
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          tripTitle: { type: SchemaType.STRING, description: "A creative title for the trip." },
          greeting: { type: SchemaType.STRING, description: "A personalized opening paragraph" },
          summary: { type: SchemaType.STRING, description: "A 2-3 sentence overview" },
          totalEstimatedCost: { type: SchemaType.STRING, description: "Estimated cost range" },
          priceIncludes: { 
            type: SchemaType.ARRAY, 
            items: { type: SchemaType.STRING },
            description: "List of inclusions"
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
              },
              required: ["name", "type", "description"]
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ItineraryResponse;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
