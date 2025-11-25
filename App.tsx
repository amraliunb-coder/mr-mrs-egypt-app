import React, { useState, useRef } from 'react';
import { generateItineraryPreview } from './services/geminiService';
import { TravelFormData, AppStatus, ItineraryResponse } from './types';
import { StepIndicator } from './components/StepIndicator';
import { TextInput, SelectCard, TextArea } from './components/InputFields';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { 
  ArrowRight, 
  Loader2, 
  DollarSign, 
  Star,
  Users,
  Heart,
  Baby,
  User
} from 'lucide-react';

const INITIAL_DATA: TravelFormData = {
  name: '',
  email: '',
  country: '',
  startDate: '',
  duration: '7',
  budgetRange: '',
  travelStyle: '',
  tripType: '',
  groupSize: 2,
  hasChildren: false,
  additionalNotes: ''
};

const HERO_IMAGE = "https://images.unsplash.com/photo-1539650116455-251d93d5ce3d?q=80&w=2000&auto=format&fit=crop";
// Placeholder logo - replace with actual asset URL
const LOGO_URL = "https://placehold.co/400x120/transparent/C9A76B?text=MR+%26+MRS+EGYPT&font=playfair-display";

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<TravelFormData>(INITIAL_DATA);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants - Increased to 9 steps to include Trip Type and Notes
  const TOTAL_STEPS = 9;

  // Handlers
  const handleChange = (field: keyof TravelFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0: // Name
        if (formData.name.length < 2) {
          setError("Please enter your full name.");
          return false;
        }
        return true;
      case 1: // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address.");
          return false;
        }
        return true;
      case 2: // Country
        if (formData.country.length < 2) {
          setError("Please enter your home country.");
          return false;
        }
        return true;
      case 3: // Dates
        if (!formData.startDate) {
          setError("Please select a start date.");
          return false;
        }
        return true;
      case 4: // Trip Type
        if (!formData.tripType) {
          setError("Please select who you are traveling with.");
          return false;
        }
        return true;
      case 5: // Group Size
        if (formData.groupSize < 1) {
          setError("Group size must be at least 1.");
          return false;
        }
        return true;
      case 6: // Budget
        if (!formData.budgetRange) {
          setError("Please select a budget range.");
          return false;
        }
        return true;
      case 7: // Style
        if (!formData.travelStyle) {
          setError("Please select a travel style.");
          return false;
        }
        return true;
      // Step 8 (Notes) is optional
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step < TOTAL_STEPS - 1) {
      setStep(prev => prev + 1);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setStatus(AppStatus.GENERATING);
    try {
      const response = await generateItineraryPreview(formData);
      setItinerary(response);
      setStatus(AppStatus.SUCCESS);
      // Scroll to top for the new view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus(AppStatus.ERROR);
      setError("We encountered an issue creating your itinerary. Please try again.");
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setStatus(AppStatus.IDLE);
    setStep(0);
    setFormData(INITIAL_DATA);
  };

  // Render Logic for Steps
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Welcome to Egypt</h2>
            <p className="text-white/70 font-sans font-light">Let's start with your name so we can address you properly.</p>
            <TextInput 
              label="Full Name" 
              placeholder="e.g. Eleanor & James" 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              autoFocus
              error={error || undefined}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Contact Details</h2>
            <p className="text-white/70 font-sans font-light">Where should we send your bespoke itinerary?</p>
            <TextInput 
              label="Email Address" 
              type="email"
              placeholder="name@example.com" 
              value={formData.email} 
              onChange={(e) => handleChange('email', e.target.value)}
              autoFocus
              error={error || undefined}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Origin</h2>
            <p className="text-white/70 font-sans font-light">Where are you traveling from?</p>
            <TextInput 
              label="Home Country" 
              placeholder="e.g. United Kingdom" 
              value={formData.country} 
              onChange={(e) => handleChange('country', e.target.value)}
              autoFocus
              error={error || undefined}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Dates & Duration</h2>
            <p className="text-white/70 font-sans font-light">When do you wish to visit the Pharaohs?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput 
                label="Approximate Start Date" 
                type="date"
                value={formData.startDate} 
                onChange={(e) => handleChange('startDate', e.target.value)}
                error={error || undefined}
              />
              <TextInput 
                label="Duration (Days)" 
                type="number"
                min={3}
                max={30}
                value={formData.duration} 
                onChange={(e) => handleChange('duration', e.target.value)}
              />
            </div>
          </div>
        );
      case 4:
        return (
           <div className="space-y-6">
             <h2 className="text-3xl font-serif text-white mb-2">Trip Type</h2>
             <p className="text-white/70 font-sans font-light">What is the occasion for your journey?</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {[
                 { val: 'Couple/Honeymoon', label: 'Couple / Honeymoon', icon: <Heart size={18} /> },
                 { val: 'Family', label: 'Family Trip', icon: <Baby size={18} /> },
                 { val: 'Group', label: 'Group of Friends', icon: <Users size={18} /> },
                 { val: 'Solo', label: 'Solo Traveler', icon: <User size={18} /> },
               ].map((opt) => (
                 <SelectCard
                   key={opt.val}
                   selected={formData.tripType === opt.val}
                   onClick={() => {
                     handleChange('tripType', opt.val);
                     // Smart default for group size
                     if (opt.val === 'Solo') handleChange('groupSize', 1);
                     if (opt.val === 'Couple/Honeymoon') handleChange('groupSize', 2);
                   }}
                   title={opt.label}
                   description=""
                   icon={opt.icon}
                 />
               ))}
             </div>
             {error && <p className="text-red-400 text-sm">{error}</p>}
           </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Travel Party</h2>
            <p className="text-white/70 font-sans font-light">Total number of guests joining.</p>
            
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
               <label className="text-sm text-[#C9A76B] font-serif uppercase tracking-wider mb-2 block">Number of Guests</label>
               <div className="flex items-center gap-6">
                 <button 
                  onClick={() => handleChange('groupSize', Math.max(1, formData.groupSize - 1))}
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-xl"
                 >-</button>
                 <span className="text-4xl font-serif">{formData.groupSize}</span>
                 <button 
                   onClick={() => handleChange('groupSize', formData.groupSize + 1)}
                   className="w-12 h-12 rounded-full border border-[#C9A76B] text-[#C9A76B] flex items-center justify-center hover:bg-[#C9A76B]/10 text-xl"
                 >+</button>
               </div>
            </div>

            {/* Show Children toggle if Family is selected OR group size > 2 */}
            {(formData.tripType === 'Family' || formData.groupSize > 2) && (
               <div className="animate-fadeInUp bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                 <span className="text-white/80">Are there children in the group?</span>
                 <div className="flex gap-2">
                   <button 
                    onClick={() => handleChange('hasChildren', true)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.hasChildren ? 'bg-[#C9A76B] text-[#222428]' : 'bg-white/10'}`}
                   >Yes</button>
                    <button 
                    onClick={() => handleChange('hasChildren', false)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${!formData.hasChildren ? 'bg-[#C9A76B] text-[#222428]' : 'bg-white/10'}`}
                   >No</button>
                 </div>
               </div>
            )}
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Budget Preference</h2>
            <p className="text-white/70 font-sans font-light">Per person, excluding international flights.</p>
            <div className="flex flex-col gap-3">
              {[
                { val: '$2,000 - $4,000', label: 'Essential Egypt', desc: 'Comfortable 4-5 star hotels and standard private tours.' },
                { val: '$4,000 - $7,000', label: 'Premium Experience', desc: 'Luxury hotels, Nile view rooms, and expert private guides.' },
                { val: '$7,000+', label: 'Ultra-Luxury', desc: 'The finest suites, private charters, and exclusive access.' },
              ].map((opt) => (
                <SelectCard
                  key={opt.val}
                  selected={formData.budgetRange === opt.val}
                  onClick={() => handleChange('budgetRange', opt.val)}
                  title={opt.label}
                  description={opt.desc}
                  icon={<DollarSign size={20} />}
                />
              ))}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Travel Style</h2>
            <p className="text-white/70 font-sans font-light">How do you envision your days?</p>
            <div className="flex flex-col gap-3">
              {[
                { val: 'Luxury', label: 'Relaxed Luxury', desc: 'Leisurely pace, spa amenities, fine dining focus.' },
                { val: 'Comfort', label: 'Cultural Immersion', desc: 'Deep dive into history, museums, and local life.' },
                { val: 'Budget', label: 'Adventure & Active', desc: 'Desert safaris, diving in the Red Sea, busy days.' },
              ].map((opt) => (
                <SelectCard
                  key={opt.val}
                  selected={formData.travelStyle === opt.val}
                  onClick={() => handleChange('travelStyle', opt.val)}
                  title={opt.label}
                  description={opt.desc}
                  icon={<Star size={20} />}
                />
              ))}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white mb-2">Final Touches</h2>
            <p className="text-white/70 font-sans font-light">Anything else we should know? (Dietary needs, special interests, accessibility)</p>
            
            <TextArea 
              label="Additional Notes (Optional)"
              placeholder="e.g. Vegetarian diet, interested in photography, celebrating a 50th birthday..."
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans overflow-x-hidden">
      {/* Background Hero */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-b from-[#222428]/60 via-[#222428]/40 to-[#222428]/90 transition-opacity duration-1000 ${status === AppStatus.SUCCESS ? 'opacity-95 bg-[#222428]' : 'opacity-100'}`}></div>
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(34,36,40,0.8)_100%)]"></div>
      </div>

      {/* Logo Area */}
      <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center print:hidden pointer-events-none">
         <div className="pointer-events-auto">
            <img 
              src={LOGO_URL} 
              alt="Mr & Mrs Egypt" 
              className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
            />
         </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8 pt-24">
        
        {status === AppStatus.SUCCESS && itinerary ? (
          // Full Itinerary View
          <ItineraryDisplay 
            data={itinerary} 
            formData={formData} 
            logoUrl={LOGO_URL}
            onReset={handleReset} 
          />
        ) : (
          // Wizard View
          <div 
            ref={containerRef}
            className={`
              w-full max-w-xl glass-panel rounded-3xl p-6 md:p-10 shadow-2xl transition-all duration-500
              ${status === AppStatus.GENERATING ? 'opacity-80 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
            `}
          >
            {status === AppStatus.GENERATING ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-[#C9A76B]/20 animate-ping"></div>
                  <Loader2 className="w-16 h-16 text-[#C9A76B] animate-spin" />
                </div>
                <h3 className="text-2xl font-serif text-white mb-2">Crafting Your Journey</h3>
                <p className="text-white/60 animate-pulse">Our AI specialists are curating your {formData.duration}-day experience...</p>
              </div>
            ) : (
              <>
                <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
                
                <div className="min-h-[320px] mb-8">
                  {renderStepContent()}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  {step > 0 ? (
                    <button 
                      onClick={() => setStep(s => s - 1)}
                      className="text-white/50 hover:text-white transition-colors text-sm font-medium px-4 py-2"
                    >
                      Back
                    </button>
                  ) : (
                     <div></div> /* Spacer */
                  )}

                  <button
                    onClick={handleNext}
                    className="
                      group relative overflow-hidden
                      bg-[#C9A76B] text-[#222428] 
                      px-8 py-3 rounded-full 
                      font-bold tracking-wide 
                      shadow-[0_4px_20px_rgba(201,167,107,0.3)]
                      hover:shadow-[0_4px_30px_rgba(201,167,107,0.5)]
                      hover:scale-[1.02]
                      active:scale-[0.98]
                      transition-all duration-300
                      flex items-center gap-2
                    "
                  >
                    <span className="relative z-10">
                      {step === TOTAL_STEPS - 1 ? 'Generate My Itinerary' : 'Continue'}
                    </span>
                    {step < TOTAL_STEPS - 1 && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                    
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Decorative Footer Elements (Hidden in Full View/Print) */}
      {status !== AppStatus.SUCCESS && (
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 opacity-20 hidden md:block print:hidden">
           <div className="h-32 bg-gradient-to-t from-[#C9A76B]/20 to-transparent"></div>
        </div>
      )}
    </div>
  );
}