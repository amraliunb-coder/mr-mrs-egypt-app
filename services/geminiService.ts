import { GoogleGenAI, Type } from "@google/genai";
import { TravelFormData, ItineraryResponse } from "../types";

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  // 1. Explicit Check for API Key
  // This ensures we catch Vercel configuration errors immediately
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey || apiKey.includes("undefined")) {
    throw new Error("API Key is missing. Please check Vercel Environment Variables.");
  }

  // 2. Initialize Client
  // We initialize here to ensure the key is available
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const model = "gemini-2.5-flash";

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
       - If Trip Type is "Group", focus on shared experiences and fun.
       - If Trip Type is "Solo", focus on immersion and personal discovery.
    2. Provide a day-by-day breakdown including specific sites (Pyramids, Luxor temples, Aswan, etc.) logically ordered geographically.
    3. Suggest 2-3 specific hotel names that match their budget/style.
    4. Include practical travel tips specific to Egypt.
    5. Incorporate any requests from the "Special Notes" if possible.
    6. ACTIVITY SELECTION: Ensure the itinerary heavily features activities matching their Primary Interest/Style (${formData.travelStyle}).
       - e.g., If "Nature", include White Desert or Sinai if time permits.
       - If "Active", include diving or hiking.
    7. GRAND EGYPTIAN MUSEUM (GEM):
       - The GEM is OFFICIALLY OPEN. Always include a visit to the Grand Egyptian Museum in the Cairo portion of the itinerary.
       - Do NOT use terms like "soft opening", "partial access", or "trial phase". Describe it as the fully realized architectural marvel it is.
    8. COST ESTIMATION FACTORS & INCLUSIONS:
       Your estimated cost range and "priceIncludes" list MUST follow these rules:
       - Private Air-Conditioned Transportation: INCLUDED.
       - All Entry Tickets: INCLUDED.
       - Domestic Flights: INCLUDE ONLY major legs (Cairo-Luxor OR Cairo-Aswan).
         * EXPLICITLY EXCLUDE flights between Luxor and Aswan (use Road or Nile Cruise).
       - Abu Simbel Trip (if applicable): Default to "Private Vehicle/Road Transfer". Only specify "Flight to Abu Simbel" if the budget is "Ultra-Luxury" or explicitly requested in notes.
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
    // Re-throw the specific error (like API Key missing) so the UI shows it
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Unable to generate itinerary at this moment.");
  }
};
