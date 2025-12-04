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
    - Trip Type: ${formData.tripType} (CRITICAL for tone/activities)
    - Budget Level: ${formData.budgetRange}
    - Primary Interest/Style: ${formData.travelStyle}
    - Party: ${formData.groupSize} people ${formData.hasChildren ? '(includes children)' : '(adults only)'}
    - Special Notes: ${formData.additionalNotes || "None"}

        Requirements:
            1. The tone must be sophisticated and professional but ADAPTED to the Trip Type:
       - If Trip Type is "Couple/Honeymoon", use romantic language (e.g., "Romantic Dinner", "Sunset Felucca", "Intimate").
       - If Trip Type is "Family", use engaging, safe, and fun language (e.g., "Family Adventure", "Interactive Tour", "Educational"). DO NOT use the word "romantic" or "couple" for families.
    
    2. ITINERARY LOGIC & LOGISTICS (CRITICAL RULES):
       - CAIRO: Always include Pyramids of Giza & The Grand Egyptian Museum (GEM is OFFICIALLY OPEN).
       - TRANSPORT CAIRO <-> UPPER EGYPT: Use "Domestic Flight" (1 hour).
       - TRANSPORT LUXOR <-> ASWAN: **NEVER** suggest a flight. It does not exist as a standard tourist route.
         * OPTION A (Default): "Private Air-Conditioned Vehicle" (approx 3.5 - 4 hours). Mention it is a scenic desert road.
         * OPTION B (Preferred for 4+ days in Upper Egypt): "Luxury Nile Cruise" (3 or 4 nights).
       - ABU SIMBEL: Default to "Private Road Transfer" (3 hours per way). Only suggest flight if budget is "Ultra-Luxury".

    3. STYLE ADAPTATION:
       - **Nature & Outdoors**: Do NOT exclude the main sights. Instead, frame them through nature.
         * In Aswan: Focus on the Botanical Gardens, Bird Watching on the Nile, and Felucca sailing.
         * In Cairo: Focus on the open-air Giza Plateau.
         * If duration > 8 days: Include the White Desert or Siwa Oasis.
         * If duration < 8 days: Stick to Nile Valley + potentially Red Sea (snorkeling/diving).
       - **Historical**: Focus on depth of information and archaeological details.
       - **Relaxation**: Pace the itinerary slower. Start late, end early. Prioritize Red Sea resorts.

    4. COST ESTIMATION FACTORS & INCLUSIONS:
       Your estimated cost range and "priceIncludes" list MUST follow these rules:
       - Private Air-Conditioned Transportation: INCLUDED.
       - All Entry Tickets: INCLUDED.
       - Domestic Flights: INCLUDE ONLY major legs (Cairo-Luxor OR Cairo-Aswan).
       - VIP Meet & Greet at airport: INCLUDED.
       - Private Egyptologist Guide: INCLUDED.

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
            tripTitle: { type: Type.STRING, description: "A creative title for the trip. MUST match the Trip Type (e.g., 'Family Expedition' vs 'Romantic Escape')." },
            greeting: { type: Type.STRING, description: "A personalized opening paragraph" },
            summary: { type: Type.STRING, description: "A 2-3 sentence overview of the vibe" },
            totalEstimatedCost: { type: Type.STRING, description: "Estimated cost range in USD per person (e.g. '$2,500 - $3,000 per person')" },
            priceIncludes: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of key inclusions. Must include: Private Transport, Entry Tickets, Domestic Flights (Cairo-Luxor/Aswan only), Meet & Greet. DO NOT include Luxor-Aswan flights."
            },
            highlights: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notes: { type: Type.STRING, description: "Evening recommendation or dining tip" }
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
                  type: { type: Type.STRING, description: "e.g. 5-Star Hotel, Dahabiya Cruise" },
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

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ItineraryResponse;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Unable to generate itinerary at this moment.");
  }
};
