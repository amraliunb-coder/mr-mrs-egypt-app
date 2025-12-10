
import { GoogleGenAI, Type } from "@google/generative-ai";
import { TravelFormData, ItineraryResponse } from "../types";

// Ensure process.env is accessible for the API key replacement defined in vite.config.ts
declare const process: { env: { API_KEY: string } };

export const generateItineraryPreview = async (formData: TravelFormData): Promise<ItineraryResponse> => {
  
  // Initialize Client
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 3. Define Schema
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      tripTitle: { 
        type: Type.STRING,
        description: "A creative title for the trip. MUST match the Trip Type (e.g., 'Family Expedition' vs 'Romantic Escape')."
      },
      greeting: { 
        type: Type.STRING,
        description: "A personalized opening paragraph"
      },
      summary: { 
        type: Type.STRING,
        description: "A 2-3 sentence overview of the trip vibe"
      },
      totalEstimatedCost: { 
        type: Type.STRING,
        description: "Estimated cost range in USD per person (e.g. '$2,500 - $3,000 per person')"
      },
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
            activities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            notes: { 
              type: Type.STRING,
              description: "Evening recommendation or dining tip"
            }
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
            type: { 
              type: Type.STRING,
              description: "e.g. 5-Star Hotel, Luxury Nile Cruise, Dahabiya Cruise, Boutique Hotel"
            },
            description: { 
              type: Type.STRING,
              description: "Hotel/cruise description. For Nile Cruises, mention fixed departure schedules (Luxor: typically Saturday, Aswan: typically Monday). For Dahabiyas, emphasize exclusivity, intimacy, and flexibility."
            }
          },
          required: ["name", "type", "description"]
        }
      },
      travelTips: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }
      }
    },
    required: ["tripTitle", "greeting", "summary", "totalEstimatedCost", "priceIncludes", "highlights", "days", "accommodationOptions", "travelTips"]
  };

  // Join the selected travel styles into a string
  const selectedStyles = formData.travelStyle.join(", ");

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
- Primary Interest/Style: ${selectedStyles}
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

3. STYLE ADAPTATION (MULTI-SELECTION LOGIC):
   You must tailor the itinerary based on the user's selected styles: [${selectedStyles}].
   - **If "Beaches, Relaxation & Sun" is selected**: You MUST include time at the Red Sea (Hurghada or Sharm) if duration allows (8+ days). If duration is short, prioritize a relaxed pace in Cairo/Luxor/Aswan with pool time and feluccas.
   - **If "Active Vacation" is selected**: Include hiking, biking, snorkeling, or desert safaris.
   - **If "Experience Culture & Local Life" is selected**: Include markets, village visits, and food tours.
   - **If "Nature & Outdoors" is selected**: Focus on landscapes, botanical gardens, and the Nile.
   - **Hybrid Logic**: If the user selected multiple styles (e.g., "History" + "Beaches"), balance the itinerary. For example, do 4 days of history in Cairo/Luxor followed by 3 days of beach relaxation. Do NOT just cram everything in; ensure a logical flow.

   **Standard Style Notes**:
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
   
   **NILE CRUISE SELECTION MATRIX** - Use this to match the RIGHT cruise to the traveler:
   
   | Cruise Name | Type | Best For | Pros | Cons | Budget Level | Best Months |
   |-------------|------|----------|------|------|--------------|-------------|
   | **Oberoi Zahra** | Luxury Cruise | Honeymooners, Luxury Families (40+), Solo Travelers seeking impeccable service | Impeccable service, spacious suites, serene design, high-quality refined menu | Highest price, fixed itinerary | Ultra-Luxury | Oct-Nov, Mar-Apr |
   | **Mövenpick Royal Lily** | Luxury Cruise | Honeymooners (ultimate romance), Luxury Families, Foodies, Solo Travelers (social) | Renovated & refined, best-in-class food, excellent bars, social atmosphere, easy to meet people | Trendy vibe may not suit everyone | Luxury | Oct-Apr |
   | **Sonesta St. George** | Standard Cruise | Families needing space, Budget-conscious luxury seekers | Large pool, family suites, spacious, reliable standard | Not boutique feel, can be crowded, impersonal service | Mid-Range to Luxury | Dec-Feb |
   | **MS Mayfair** | Standard Cruise | Design lovers, Solo travelers seeking comfort, Value seekers | Stunning design, good value, comfortable setting to connect | Smallest cabins, fewest amenities, not the most intimate | Mid-Range | Any month |
   | **Dahabiya** (Boutique) | Boutique Sailboat | Honeymooners (ultimate privacy), Adventurous souls, Small groups (2-8 people), Design lovers | Ultimate privacy, flexible itinerary, authentic experience, includes all meals + alcohol + excursions, stunning design, excellent food | Higher price than standard cruises, slower pace | Luxury to Ultra-Luxury | Oct-Apr |
   
   **DECISION LOGIC - Select cruise based on:**
   
   1. **HONEYMOONERS / COUPLES**:
      - Ultra-Luxury Budget: **Dahabiya** (ultimate privacy & uniqueness) OR **Oberoi Zahra** (unmatched service)
      - Luxury Budget: **Mövenpick Royal Lily** (ultimate romance) OR **Dahabiya**
      - Mid-Range Budget: **MS Mayfair** (classic, reliable romance)
   
   2. **FAMILIES**:
      - With Children: **Sonesta St. George** (space & family suites, large pool)
      - Luxury Families (teens/older kids): **Mövenpick Royal Lily** (better food & refined) OR **Oberoi Zahra** (impeccable service)
   
   3. **SOLO TRAVELERS**:
      - 40+ seeking luxury: **Oberoi Zahra** (safe, impeccable service)
      - Social travelers: **Mövenpick Royal Lily** (easy to meet people) OR **MS Mayfair** (comfortable setting)
   
   4. **BY TRAVEL STYLE**:
      - **Design Lovers**: **MS Mayfair** (stunning design) OR **Dahabiya** (boutique aesthetic)
      - **Foodies**: **Mövenpick Royal Lily** (best-in-class food) OR **Oberoi Zahra** (refined cuisine)
      - **Adventurous/Unique Experience**: **Dahabiya** (the only choice for authentic, flexible journey)
      - **Relaxation/Privacy**: **Dahabiya** OR **Oberoi Zahra**
   
   5. **INCLUSIONS NOTE**:
      - Standard Cruises (Oberoi, Mövenpick, Sonesta, Mayfair): Include most meals & basic drinks. Premium alcohol and some excursions may be upsold.
      - Dahabiya: ALL-INCLUSIVE (all meals, all alcohol, all excursions included - nothing upsold)
   
   6. **RECOMMENDED LENGTH**:
      - Oberoi Zahra: 4-7 nights
      - Mövenpick Royal Lily: 4-5 nights
      - Sonesta St. George: 3-4 nights
      - MS Mayfair: 4-5 nights
      - Dahabiya: 5-7 nights (slower pace, more immersive)
   
   **When recommending cruises in accommodationOptions:**
   - Always suggest 2-3 cruise options that match the traveler profile
   - Mention the key selling point for each (e.g., "Oberoi Zahra - renowned for impeccable service and spacious suites")
   - For Dahabiyas, emphasize the all-inclusive nature and flexibility
   - Note the fixed departure schedules for standard cruises
   
   Cruise examples by budget:
   - Mid-Range Cruises: MS Mayfair, Sonesta St. George
   - Luxury Cruises: Mövenpick Royal Lily, Oberoi Philae, Sanctuary Sun Boat IV
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

  // 5. Generate Content
  try {
    console.log(`Generating itinerary with model: gemini-2.5-flash`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("No response from AI");
    }
    
    return JSON.parse(text) as ItineraryResponse;

  } catch (error: any) {
    console.error(`Error generating itinerary:`, error?.message || error);
    throw error;
  }
};
