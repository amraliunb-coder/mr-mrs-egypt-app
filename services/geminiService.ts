import { GoogleGenerativeAI } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from '../types';

// Declare environment variable type
declare const process: { env: { VITE_GEMINI_API_KEY: string } };

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // Initialize Client
  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  // Define Schema - Use string literals instead of Type enum
  const responseSchema = {
    type: "object",
    properties: {
      tripTitle: { 
        type: "string",
        description: "A creative title for the trip. MUST match the Trip Type (e.g., 'Family Expedition' vs 'Romantic Escape')."
      },
      greeting: { 
        type: "string",
        description: "A personalized opening paragraph"
      },
      summary: { 
        type: "string",
        description: "A 2-3 sentence overview of the trip vibe"
      },
      totalEstimatedCost: { 
        type: "string",
        description: "Estimated cost range in USD per person (e.g. '$2,500 - $3,000 per person')"
      },
      priceIncludes: { 
        type: "array", 
        items: { type: "string" },
        description: "List of key inclusions. Must include: Private Transport, Entry Tickets, Domestic Flights (Cairo-Luxor/Aswan only), Meet & Greet. DO NOT include Luxor-Aswan flights."
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
              description: "e.g. 5-Star Hotel, Luxury Nile Cruise, Dahabiya Cruise, Boutique Hotel"
            },
            description: { 
              type: "string",
              description: "Hotel/cruise description. For Nile Cruises, mention fixed departure schedules (Luxor: typically Saturday, Aswan: typically Monday). For Dahabiyas, emphasize exclusivity, intimacy, and flexibility."
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

  // Join the selected travel styles into a string
  const selectedStyles = Array.isArray(formData.travelStyle) ? formData.travelStyle.join(", ") : formData.travelStyle;

  // Enhanced Prompt with All Requirements
  const prompt = `
You are a senior luxury travel consultant for "Mr & Mrs Egypt". 
Create a complete, detailed ${formData.duration}-day itinerary for a client.

CLIENT DETAILS:
- Name: ${formData.name}
- Origin: ${formData.country}
- Dates: Starting ${formData.startDate} for ${formData.duration} days
- Trip Type: ${formData.tripType} (CRITICAL for tone/activities)
- Budget Level: ${formData.budgetRange}
- Primary Interest/Style: ${selectedStyles}
- Party: ${formData.groupSize} people ${formData.hasChildren ? '(includes children)' : '(adults only)'}
- Special Notes: ${formData.additionalNotes || "None"}

REQUIREMENTS:

1. TONE & LANGUAGE ADAPTATION:
   The tone must be sophisticated and professional but ADAPTED to the Trip Type:
   - If Trip Type is "Couple/Honeymoon": Use romantic language (e.g., "Romantic Dinner", "Sunset Felucca", "Intimate Moments", "Couples' Experience").
   - If Trip Type is "Family": Use engaging, safe, and fun language (e.g., "Family Adventure", "Interactive Tour", "Educational Experience", "Kid-Friendly"). DO NOT use the word "romantic" or
