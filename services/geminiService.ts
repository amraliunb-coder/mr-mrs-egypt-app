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
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-001",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
  ];

  let lastError: any = null;

  // Helper function to wait/delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
              tripTitle: { 
                type: SchemaType.STRING,
                description: "A creative title for the trip. MUST match the Trip Type (e.g., 'Family Expedition' vs 'Romantic Escape')."
              },
              greeting: { 
                type: SchemaType.STRING,
                description: "A personalized opening paragraph"
              },
              summary: { 
                type: SchemaType.STRING,
                description: "A 2-3 sentence overview of the trip vibe"
              },
              totalEstimatedCost: { 
                type: SchemaType.STRING,
                description: "Estimated cost range in USD per person (e.g. '$2,500 - $3,000 per person')"
              },
              priceIncludes: { 
                type: SchemaType.ARRAY, 
                items: { type: SchemaType.STRING },
                description: "List of key inclusions. Must include: Private Transport, Entry Tickets, Domestic Flights (Cairo-Luxor/Aswan only), Meet & Greet. DO NOT include Luxor-Aswan flights."
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
                    notes: { 
                      type: SchemaType.STRING,
                      description: "Evening recommendation or dining tip"
                    }
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
                    type: { 
                      type: SchemaType.STRING,
                      description: "e.g. 5-Star Hotel, Luxury Nile Cruise, Dahabiya Cruise, Boutique Hotel"
                    },
                    description: { 
                      type: SchemaType.STRING,
                      description: "Hotel/cruise description. For Nile Cruises, mention fixed departure schedules (Luxor: typically Saturday, Aswan: typically Monday). For Dahabiyas, emphasize exclusivity, intimacy, and flexibility."
                    }
                  },
                  required: ["name", "type", "description"]
                }
              },
              travelTips: { 
                type: SchemaType.ARRAY, 
                items: { type: SchemaType.STRING }
              }
            },
            required: ["tripTitle", "greeting", "summary", "totalEstimatedCost", "priceIncludes", "highlights", "days", "accommodationOptions", "travelTips"]
          }
        }
      });

      // 4. Enhanced Prompt with All Requirements
      const prompt = `
You are a senior luxury travel consultant for "Mr & Mrs Egypt". 
Create a complete, detailed ${formData.duration}-day itinerary for a client.

CLIENT DETAILS:
- Name: ${formData.name}
- Origin: ${formData.country}
- Dates: Starting ${formData.startDate} for ${formData.duration} days
- Trip Type: ${formData.tripType} (CRITICAL for tone/activities)
- Budget Level: ${formData.budgetRange}
- Primary Interest/Style: ${formData.travelStyle}
- Party: ${formData.groupSize} people ${formData.hasChildren ? '(includes children)' : '(adults only)'}
- Special Notes: ${formData.additionalNotes || "None"}

REQUIREMENTS:

1. TONE & LANGUAGE ADAPTATION:
   The tone must be sophisticated and professional but ADAPTED to the Trip Type:
   - If Trip Type is "Couple/Honeymoon": Use romantic language (e.g., "Romantic Dinner", "Sunset Felucca", "Intimate Moments", "Couples' Experience").
   - If Trip Type is "Family": Use engaging, safe, and fun language (e.g., "Family Adventure", "Interactive Tour", "Educational Experience", "Kid-Friendly"). DO NOT use the word "romantic" or "couple" for families.
   - If Trip Type is "Solo": Focus on personal discovery, flexibility, and cultural immersion.
   - If Trip Type is "Group": Emphasize shared experiences, camaraderie, and group dynamics.

2. ITINERARY LOGIC & LOGISTICS (CRITICAL RULES):
   
   CAIRO:
   - Always include Pyramids of Giza & The Grand Egyptian Museum (GEM is OFFICIALLY OPEN and fully operational).
   - For longer trips (7+ days), consider adding Saqqara, Memphis, or Dahshur.
   
   TRANSPORT CAIRO ↔ UPPER EGYPT:
   - Use "Domestic Flight" (approximately 1 hour flight time).
   - Routes available: Cairo-Luxor, Cairo-Aswan.
   - **CRITICAL FLOW LOGIC**: Upper Egypt trips follow a ONE-WAY pattern to avoid backtracking:
     * If starting in LUXOR: Fly Cairo → Luxor, travel Luxor → Aswan (by road or cruise), fly Aswan → Cairo.
     * If starting in ASWAN: Fly Cairo → Aswan, travel Aswan → Luxor (by road or cruise), fly Luxor → Cairo.
     * NEVER fly round-trip to the same city (e.g., Cairo-Luxor-Cairo) if visiting both Luxor and Aswan.
   - This creates efficient flow and avoids unnecessary backtracking.
   
   TRANSPORT LUXOR ↔ ASWAN:
   - **NEVER** suggest a flight between Luxor and Aswan. This route does not exist as a standard tourist route.
   - OPTION A (Default for shorter trips): "Private Air-Conditioned Vehicle" (approximately 3.5 - 4 hours). Mention it is a scenic desert road along the Nile. This is unidirectional travel - you move from one city to the other and fly back to Cairo from the destination city.
   - OPTION B (Preferred for 4+ days in Upper Egypt or luxury trips): "Luxury Nile Cruise" (3 or 4 nights) stopping at temples between Luxor and Aswan (Edfu, Kom Ombo). Cruises are unidirectional - either Luxor to Aswan or Aswan to Luxor based on departure schedule.
   
   ABU SIMBEL:
   - Default to "Private Road Transfer" from Aswan (approximately 3 hours each way, early morning departure).
   - Only suggest a domestic flight if budget is "Ultra-Luxury" or "Luxury" and explicitly mentioned.
   
   RED SEA EXTENSIONS:
   - For relaxation-focused trips or trips over 8 days, consider adding Hurghada or Sharm El-Sheikh.
   - **CRITICAL FLOW FOR 12+ DAY TRIPS WITH BEACHES/RELAXATION**:
     * Logical flow: Cairo → Aswan → Luxor → Hurghada/Red Sea Resort
     * This allows ending the cultural portion in Luxor and seamlessly transitioning to beach relaxation
     * NEVER route back to Cairo before going to the Red Sea from Upper Egypt
   - **Transport Luxor → Hurghada**: 
     * Default: "Private Air-Conditioned Vehicle" (approximately 3.5 hours, scenic desert road)
     * Only suggest domestic flight if budget is "Ultra-Luxury" and explicitly mentioned
     * Road transfer is comfortable and preferred by most travelers
   - **Transport from Red Sea to Cairo** (end of trip):
     * Hurghada → Cairo: Domestic flight (1 hour) OR private transfer (5-6 hours)
     * Sharm El-Sheikh → Cairo: Domestic flight only (1 hour)
   - Red Sea stay duration: Minimum 3 nights, ideally 4-5 nights for proper relaxation

3. STYLE ADAPTATION:

   **Nature & Outdoors**:
   - Do NOT exclude the main sights (Pyramids, Temples). Instead, frame them through a nature lens.
   - In Aswan: Emphasize Botanical Gardens, Bird Watching on the Nile, Felucca sailing at sunset.
   - In Cairo: Highlight the open-air experience of the Giza Plateau.
   - In Luxor: Morning hot air balloon rides, cycling tours through villages.
   - If duration > 8 days: Consider adding the White Desert, Siwa Oasis, or Red Sea for snorkeling/diving.
   - If duration < 8 days: Stick to Nile Valley sites with nature-focused framing.
   
   **Historical/Archaeological**:
   - Focus on depth of information and archaeological significance.
   - Emphasize Egyptologist-guided tours with detailed explanations.
   - Include lesser-known sites if time permits (e.g., Dendera, Abydos).
   
   **Relaxation/Leisure**:
   - Pace the itinerary slower. Start late (after 9 AM), end early (by 3 PM).
   - Build in spa time, pool time, or free time daily.
   - **For trips 12+ days**: MUST include Red Sea extension (minimum 3-4 nights) at the END of the trip.
   - **Optimal flow for beach trips**: Cairo → Aswan → Luxor → Hurghada/Red Sea (NOT back to Cairo between Luxor and Red Sea).
   - Prioritize Red Sea resorts for beach days (Hurghada, Marsa Alam, or Sharm El-Sheikh).
   - Suggest sunset experiences (felucca rides, rooftop dining).
   
   **Cultural Immersion**:
   - Include local experiences: market visits, cooking classes, artisan workshops.
   - Nubian village visits in Aswan.
   - Traditional performances (Tanoura, belly dancing).
   
   **Adventure**:
   - Hot air balloon rides in Luxor.
   - Quad biking or camel rides near the pyramids.
   - Snorkeling/diving in the Red Sea.
   - Desert camping experiences.

4. COST ESTIMATION & INCLUSIONS:
   
   Your estimated cost range and "priceIncludes" list MUST follow these rules:
   
   ALWAYS INCLUDED:
   - Private Air-Conditioned Transportation (for all ground transfers)
   - All Entry Tickets to sites and museums
   - Private Egyptologist Guide (for all touring days)
   - VIP Meet & Greet at airport upon arrival
   - Domestic Flights: Include based on Upper Egypt flow:
     * If visiting ONLY Luxor: Cairo-Luxor round-trip
     * If visiting ONLY Aswan: Cairo-Aswan round-trip  
     * If visiting BOTH Luxor & Aswan: One-way flights (Cairo → Luxor, Aswan → Cairo) OR (Cairo → Aswan, Luxor → Cairo)
     * If adding RED SEA from Upper Egypt: Include Cairo → Aswan (or Luxor), then Hurghada → Cairo at end (Luxor-Hurghada is by road unless Ultra-Luxury)
     * DO NOT include Luxor-Aswan flights (they don't exist as regular routes)
     * DO NOT include Luxor-Hurghada flights unless Ultra-Luxury budget
   
   NEVER INCLUDED:
   - International flights
   - Visa fees
   - Gratuities/tips
   - Personal expenses
   - Optional experiences not listed in itinerary
   
   BUDGET GUIDELINES (per person, based on party size and duration):
   - Budget: $1,500 - $2,500 (3-5 days), $2,500 - $4,000 (6-10 days)
   - Mid-Range: $2,500 - $4,000 (3-5 days), $4,000 - $6,500 (6-10 days)
   - Luxury: $4,000 - $7,000 (3-5 days), $7,000 - $12,000 (6-10 days)
   - Ultra-Luxury: $8,000 - $15,000 (3-5 days), $15,000 - $25,000+ (6-10 days)

5. ACCOMMODATION RECOMMENDATIONS:
   - Suggest 2-3 specific hotel options matching the budget level.
   - Include mix of hotel styles (e.g., historic charm vs modern luxury).
   
   **For Nile Cruises:**
   - If your itinerary includes a Nile Cruise between Luxor and Aswan, you MUST include cruise options in the accommodationOptions array.
   - Specify whether it's a 3-night or 4-night cruise.
   - Add a note that standard Nile Cruises have fixed schedules (typically Saturday departures from Luxor, Monday departures from Aswan).
   - For Luxury/Ultra-Luxury budgets OR for Couple/Honeymoon/Small Group trips, also suggest Dahabiya cruises as a more exclusive boutique option.
   - Dahabiya notes: Private sailboats with 8-12 cabins, more intimate and flexible, sail-powered with slower pace, ideal for honeymoons and small groups.
   
   Cruise examples by budget:
   - Mid-Range Cruises: M/S Mayfair, M/S Royal Esadora, M/S Princess Sarah
   - Luxury Cruises: M/S Farah, Oberoi Philae, Sanctuary Sun Boat IV
   - Ultra-Luxury Cruises: Oberoi Zahra, Sanctuary Sun Boat III
   - Dahabiya (Luxury/Ultra-Luxury): Dahabiya Amoura, Nebyt Dahabiya, Sanctuary Zein Nile Chateau
   
   Hotel examples by budget:
   - Budget: Steigenberger Pyramids Cairo, Iberotel Luxor
   - Mid-Range: Marriott Mena House Cairo, Hilton Luxor Resort & Spa
   - Luxury: Four Seasons Cairo at Nile Plaza, Sofitel Winter Palace Luxor, Sofitel Legend Old Cataract Aswan
   - Ultra-Luxury: The Ritz-Carlton Cairo, Sofitel Winter Palace Luxor

6. DAY-BY-DAY STRUCTURE:
   - Each day should have a clear title reflecting the theme (e.g., "Day 1: Ancient Wonders of Giza").
   - List 3-6 activities per day, depending on pace.
   - Include timing context where relevant (e.g., "Morning: Visit the Pyramids", "Afternoon: Explore GEM").
   - **Flight Days**: When mentioning flights, be specific about direction based on Upper Egypt flow:
     * Example: "Morning flight from Cairo to Luxor" (if starting in Luxor)
     * Example: "Evening flight from Aswan back to Cairo" (if ending in Aswan)
     * If doing Luxor → Aswan: mention "flight from Cairo to Luxor" early, then "flight from Aswan to Cairo" at end
     * If doing Aswan → Luxor: mention "flight from Cairo to Aswan" early, then "flight from Luxor to Cairo" at end
     * **For Red Sea extensions**: Mention "Private transfer from Luxor to Hurghada (3.5 hours)" and later "Flight from Hurghada to Cairo" (unless Ultra-Luxury, then can mention flight option)
   - Add evening notes with dining or leisure suggestions.
   - Ensure logical flow and geographical grouping (don't zigzag across cities unnecessarily).

7. TRAVEL TIPS:
   - Include 5-7 practical tips relevant to Egypt travel.
   - Examples: Best time to visit, what to wear, currency, tipping customs, photography rules, health precautions.

Return a strict JSON object matching the requested schema. Ensure all required fields are present and properly formatted.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("No response from AI");
      }
      
      console.log(`Success with model: ${modelName}`);
      return JSON.parse(text) as ItineraryResponse;

    } catch (error: any) {
      console.error(`Error with model ${modelName}:`, error?.message || error);
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error?.message?.includes("429") || error?.message?.includes("quota")) {
        console.log("Rate limit hit. Waiting 7 seconds before trying next model...");
        await delay(7000); // Wait 7 seconds as suggested by the error
        continue;
      }
      
      // If it's not a 404 or rate limit error, don't try other models
      if (!error?.message?.includes("404") && !error?.message?.includes("not found")) {
        throw error;
      }
      
      // Continue to next model if this one failed with 404
      continue;
    }
  }

  // If we got here, all models failed
  throw new Error(
    `Failed to generate itinerary with all available models. Last error: ${lastError?.message || "Unknown error"}. ` +
    `Please verify your API key is valid and has access to Gemini models.`
  );
};
