
export interface TravelFormData {
  name: string;
  email: string;
  country: string;
  startDate: string;
  duration: string;
  budgetRange: string;
  travelStyle: string; // Changed from union type to string to support flexible new categories
  tripType: 'Couple/Honeymoon' | 'Family' | 'Group' | 'Solo' | '';
  groupSize: number;
  hasChildren: boolean;
  additionalNotes: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
  notes: string;
}

export interface Accommodation {
  name: string;
  type: string;
  description: string;
}

export interface ItineraryResponse {
  tripTitle: string;
  greeting: string;
  summary: string;
  totalEstimatedCost: string;
  priceIncludes: string[];
  highlights: string[];
  days: DayPlan[];
  accommodationOptions: Accommodation[];
  travelTips: string[];
}

export enum AppStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}
