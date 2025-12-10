import { GoogleGenerativeAI } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from '../types';

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const responseSchema = {
    type: "object",
    properties: {
      tripTitle: { 
        type: "string",
        description: "A creative title for the trip"
      },
      greeting: { 
        type: "string",
        description: "A personalized opening paragraph"
      },
      summary: { 
        type: "string",
        description: "A 2-3 sentence overview of the trip"
      },
      totalEstimatedCost: { 
        type: "string",
        description: "Estimated cost range in USD per person"
      },
      priceIncludes: { 
        type: "array", 
        items: { type: "string" },
        description: "List of key inclusions"
      },
      highlights: { 
        type: "array",
        items: { type: "string" }
      },
      days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "integer" },
            title: { type: "string" },
            activities: { 
              type: "array", 
              items: { type: "string" }
            },
            notes: { 
              type: "string",
              description: "Evening recommendation or dining tip"
            }
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
            type: { 
              type: "string",
              description: "Hotel type"
            },
            description: { 
              type: "string",
              description: "Hotel description"
            }
          },
          required: ["name", "type", "description"]
        }
      },
      travelTips: { 
        type: "array", 
        items: { type: "string" }
      }
    },
    required: ["tripTitle", "greeting", "summary", "totalEstimatedCost", "priceIncludes", "highlights", "days", "accommodationOptions", "travelTips"]
  };

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

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      }
    });

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("No response from AI");
    }
    
    return JSON.parse(text) as ItineraryResponse;

  } catch (error: any) {
    console.error('Error generating itinerary:', error?.message || error);
    throw new Error(`Failed to generate itinerary: ${error?.message || 'Unknown error'}`);
  }
};
