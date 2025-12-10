import { GoogleGenerativeAI } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from '../types';

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // Initialize Client with proper environment variable access
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  // Define Schema - Use string literals
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

  // Construct the prompt
  const prompt = `You are a senior luxury travel consultant for "Mr & Mrs Egypt". 
Create a complete, detailed ${formData.duration}-day itinerary for a client.

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

1. TONE ADAPTATION:
   - If Trip Type is "Couple/Honeymoon": Use romantic language
   - If Trip Type is "Family": Use engaging, safe language (no romantic terms)
   - If Trip Type is "Solo": Focus on personal discovery
   - If Trip Type is "Group": Emphasize shared experiences

2. ITINERARY MUST INCLUDE:
   - Cairo: Pyramids of Giza and Grand Egyptian Museum
   - For 7+ days: Consider Luxor, Aswan, or Red Sea
   - Use domestic flights between Cairo and Upper Egypt cities
   - Private transportation for all ground transfers

3. COST GUIDELINES (per person):
   - Budget: $1,500-$4,000
   - Mid-Range: $2,500-$6,500
   - Luxury: $4,000-$12,000
   - Ultra-Luxury: $8,000-$25,000+

4. ACCOMMODATIONS:
   - Suggest 2-3 specific hotels matching budget level
   - Include hotel type and brief description

5. DAY-BY-DAY:
   - Clear title for each day
   - 3-6 activities per day
   - Include timing context
   - Add evening dining suggestions in notes

6. TRAVEL TIPS:
   - Include 5-7 practical tips for Egypt travel

Return a strict JSON object matching the requested schema.`;

  // Generate Content
  try {
    console.log('Generating itinerary with Gemini AI...');
    
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
    
    console.log('Itinerary generated successfully');
    return JSON.parse(text) as ItineraryResponse;

  } catch (error: any) {
    console.error('Error generating itinerary:', error?.message || error);
    throw new Error(`Failed to generate itinerary: ${error?.message || 'Unknown error'}`);
  }
};
