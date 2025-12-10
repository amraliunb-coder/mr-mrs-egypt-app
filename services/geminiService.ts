import { GoogleGenerativeAI } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from '../types';

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // Initialize Client - Use the environment variable that was working before
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  // Define Schema - Use string literals instead of Type enum
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

  // Join the selected travel styles
  const selectedStyles = Array.isArray(formData.travelStyle) ? formData.travelStyle.join(", ") : formData.travelStyle;

  // Construct the prompt - simplified to avoid string literal issues
  const prompt = `You are a senior luxury travel consultant for "Mr & Mrs Egypt". Create a complete, detailed ${formData.duration}-day itinerary for a client.

CLIENT DETAILS:
- Name: ${formData.name}
- Origin: ${formData.country}
- Dates: Starting ${formData.startDate} for ${formData.duration} days
- Trip Type: ${formData.tripType}
- Budget Level: ${formData.budgetRange}
- Primary Interest: ${selectedStyles}
- Party: ${formData.groupSize} people ${formData.hasChildren ? '(includes children)' : '(adults only)'}
- Special Notes: ${formData.additionalNotes || "None"}

REQUIREMENTS:
1. TONE: Adapt language to trip type (romantic for couples, family-friendly for families, personal for solo, group-oriented for groups)
2. MUST INCLUDE: Cairo (Pyramids & Grand Egyptian Museum), consider Luxor/Aswan for 7+ days
3. TRANSPORT: Use domestic flights between Cairo and Upper Egypt, private vehicles for ground transfers
4. COST RANGE: Provide realistic estimate based on budget level
5. ACCOMMODATIONS: Suggest 2-3 specific hotels matching budget
6. DAILY STRUCTURE: Clear titles, 3-6 activities per day with timing, evening dining notes
7. TRAVEL TIPS: Include 5-7 practical Egypt travel tips

Return a strict JSON object matching the schema.`;

  // Generate Content
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      }
    });

    const response = await result.response;
    const
