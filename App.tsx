
import React, { useState, useRef } from 'react';
import { generateItineraryPreview } from './services/geminiService';
import { TravelFormData, AppStatus, ItineraryResponse } from './types';
import { StepIndicator } from './components/StepIndicator';
import { TextInput, SelectCard, TextArea } from './components/InputFields';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { LandingHeader } from './components/LandingHeader';
import { 
  ArrowRight, 
  Loader2, 
  DollarSign, 
  Star,
  Users,
  Heart,
  Baby,
  User,
  AlertCircle,
  Landmark,
  Mountain,
  Compass,
  Sun,
  Coffee
} from 'lucide-react';

const INITIAL_DATA: TravelFormData = {
  name: '',
  email: '',
  country: '',
  startDate: '',
  duration: '7',
  budgetRange: '',
  travelStyle: [], // Changed to array
  tripType: '',
  groupSize: 2,
  hasChildren: false,
  additionalNotes: ''
};

// Wizard Background
const WIZARD_BG = "https://images.unsplash.com/photo-1539650116455-251d93d5ce3d?q=80&w=2000&auto=format&fit=crop";
// Logo URL - Updated to the colored version
const LOGO_URL = "https://res.cloudinary.com/drzid08rg/image/upload/colored-logo_tjemee.png";

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<TravelFormData>(INITIAL_DATA);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for scrolling to the wizard section
  const wizardSectionRef = useRef<HTMLElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Constants - Increased to 9 steps to include Trip Type and Notes
  const TOTAL_STEPS = 9;

  // Scroll Handler
  const scrollToWizard = () => {
    wizardSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      case 6: // Style (Swapped)
        if (formData.travelStyle.length === 0) {
          setError("Please select at least one travel style.");
          return false;
        }
        return true;
      case 7: // Budget (Swapped)
        if (!formData.budgetRange) {
          setError("Please select a budget range.");
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
      if (formContainerRef.current) formContainerRef.current.scrollTop = 0;
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setStatus(AppStatus.GENERATING);
    setError(null);
    
    try {
      const response = await generateItineraryPreview(formData);
      setItinerary(response);
      setStatus(AppStatus.SUCCESS);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for full itinerary view
    } catch (err: any) {
      console.error("Submission Error:", err);
      setStatus(AppStatus.ERROR);
      setError(err.message || "We encountered an issue creating your itinerary. Please check your connection and try again.");
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setStatus(AppStatus.IDLE);
    setStep(0);
    setFormData(INITIAL_DATA);
    setError(null);
    setTimeout(() => scrollToWizard(), 100);
  };

  // Render Logic for Steps
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Welcome to Egypt</h2>
            <p className="text-gray-600 font-sans font-light">Let's start with your name so we can address you properly.</p>
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
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Contact Details</h2>
            <p className="text-gray-600 font-sans font-light">Where should we send your bespoke itinerary?</p>
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
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Origin</h2>
            <p className="text-gray-600 font-sans font-light">Where are you traveling from?</p>
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
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Dates & Duration</h2>
            <p className="text-gray-600 font-sans font-light">When do you wish to visit the Pharaohs?</p>
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
             <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Trip Type</h2>
             <p className="text-gray-600 font-sans font-light">What is the occasion for your journey?</p>
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
                     if (opt.val === 'Solo') handleChange('groupSize', 1);
                     if (opt.val === 'Couple/Honeymoon') handleChange('groupSize', 2);
                   }}
                   title={opt.label}
                   description=""
                   icon={opt.icon}
                 />
               ))}
             </div>
             {error && <p className="text-red-500 text-sm">{error}</p>}
           </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Travel Party</h2>
            <p className="text-gray-600 font-sans font-light">Total number of guests joining.</p>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <label className="text-sm text-[#2C3E50] font-serif uppercase tracking-wider mb-2 block font-semibold">Number of Guests</label>
               <div className="flex items-center gap-6">
                 <button 
                  onClick={() => handleChange('groupSize', Math.max(1, formData.groupSize - 1))}
                  className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-xl text-[#2C3E50]"
                 >-</button>
                 <span className="text-4xl font-serif text-[#2C3E50]">{formData.groupSize}</span>
                 <button 
                   onClick={() => handleChange('groupSize', formData.groupSize + 1)}
                   className="w-12 h-12 rounded-full border border-[#C5B097] text-[#C5B097] flex items-center justify-center hover:bg-[#C5B097]/10 text-xl"
                 >+</button>
               </div>
            </div>

            {(formData.tripType === 'Family' || formData.groupSize > 2) && (
               <div className="animate-fadeInUp bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                 <span className="text-[#2C3E50]">Are there children in the group?</span>
                 <div className="flex gap-2">
                   <button 
                    onClick={() => handleChange('hasChildren', true)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.hasChildren ? 'bg-[#C5B097] text-white' : 'bg-gray-100 text-gray-600'}`}
                   >Yes</button>
                    <button 
                    onClick={() => handleChange('hasChildren', false)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${!formData.hasChildren ? 'bg-[#C5B097] text-white' : 'bg-gray-100 text-gray-600'}`}
                   >No</button>
                 </div>
               </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case 6: // TRAVEL STYLE (Multiple Selection)
        const toggleStyle = (val: string) => {
          const currentStyles = formData.travelStyle;
          let newStyles: string[];
          if (currentStyles.includes(val)) {
            newStyles = currentStyles.filter(style => style !== val);
          } else {
            newStyles = [...currentStyles, val];
          }
          handleChange('travelStyle', newStyles);
        };

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Travel Style</h2>
            <p className="text-gray-600 font-sans font-light">How do you envision your days? (Select all that apply)</p>
            <div className="flex flex-col gap-3">
              {[
                { 
                  val: 'Historical Sites, Museums & Monuments', 
                  label: 'Historical Sites & Monuments', 
                  desc: 'Pyramids, Nile temples, museums, and iconic citadels.',
                  icon: <Landmark size={20} />
                },
                { 
                  val: 'Nature & Outdoors', 
                  label: 'Nature & Outdoors', 
                  desc: 'White Desert, Sinai canyons, and remote oases.',
                  icon: <Mountain size={20} />
                },
                { 
                  val: 'Active Vacation', 
                  label: 'Active Vacation', 
                  desc: 'Red Sea diving, camel trekking, and canyon hiking.',
                  icon: <Compass size={20} />
                },
                { 
                  val: 'Beaches, Relaxation & Sun', 
                  label: 'Beaches, Relaxation & Sun', 
                  desc: 'Red Sea beaches, natural springs, and relaxation.',
                  icon: <Sun size={20} />
                },
                { 
                  val: 'Experience Culture & Local Life', 
                  label: 'Culture & Local Life', 
                  desc: 'Bazaars, coffeehouses, and immersive village life.',
                  icon: <Coffee size={20} />
                },
              ].map((opt) => (
                <SelectCard
                  key={opt.val}
                  selected={formData.travelStyle.includes(opt.val)}
                  onClick={() => toggleStyle(opt.val)}
                  title={opt.label}
                  description={opt.desc}
                  icon={opt.icon}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case 7: // BUDGET STEP (Swapped)
        const days = parseInt(formData.duration) || 7;
        const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
        
        // Estimated Daily Rates per Person
        const RATE_ESSENTIAL = 300;
        const RATE_PREMIUM_LOW = 350;
        const RATE_PREMIUM_HIGH = 500;
        const RATE_LUXURY = 800;

        const essentialMax = days * RATE_ESSENTIAL;
        const premiumMin = days * RATE_PREMIUM_LOW;
        const premiumMax = days * RATE_PREMIUM_HIGH;
        const luxuryMin = days * RATE_LUXURY;

        // Dynamic Labels
        const lblEssential = `Essential (Less than ${fmt(essentialMax)} pp)`;
        const lblPremium = `Premium (${fmt(premiumMin)} - ${fmt(premiumMax)} pp)`;
        const lblLuxury = `Ultra-Luxury (${fmt(luxuryMin)}+ pp)`;

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Budget Preference</h2>
              <div className="p-4 bg-[#F9F9F7] border border-[#C5B097]/20 rounded-lg text-sm text-gray-600 leading-relaxed">
                <p>
                  <span className="font-bold text-[#C5B097]">Mr & Mrs Egypt</span> trips include activities, accommodations, and private transportation. 
                  Your specialists will work with you to decide where to splurge and when to save on your <span className="font-bold text-[#2C3E50]">{days}-day</span> trip.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {[
                { 
                  val: lblEssential, // Value sent to AI
                  label: 'Essential', 
                  sub: `Less than ${fmt(essentialMax)} per person`,
                  desc: 'Comfortable 4-5 star hotels and standard private tours.' 
                },
                { 
                  val: lblPremium, 
                  label: 'Premium', 
                  sub: `${fmt(premiumMin)} - ${fmt(premiumMax)} per person`,
                  desc: 'Luxury hotels, Nile view rooms, and expert private guides.' 
                },
                { 
                  val: lblLuxury, 
                  label: 'Ultra-Luxury', 
                  sub: `${fmt(luxuryMin)}+ per person`,
                  desc: 'The finest suites, private charters, and exclusive access.' 
                },
              ].map((opt) => (
                <SelectCard
                  key={opt.label}
                  selected={formData.budgetRange === opt.val}
                  onClick={() => handleChange('budgetRange', opt.val)}
                  title={`${opt.label}`}
                  description={`${opt.sub} — ${opt.desc}`}
                  icon={<DollarSign size={20} />}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-[#2C3E50] mb-2">Final Touches</h2>
            <p className="text-gray-600 font-sans font-light">Anything else we should know? (Dietary needs, special interests, accessibility)</p>
            
            <TextArea 
              label="Additional Notes (Optional)"
              placeholder="e.g. Vegetarian diet, interested in photography, celebrating a 50th birthday..."
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              autoFocus
            />
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 animate-fadeInUp flex gap-3 items-start">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // If we have a generated itinerary, show the full view (overlaying everything)
  if (status === AppStatus.SUCCESS && itinerary) {
    return (
      <div className="bg-[#F9F9F7] min-h-screen">
        <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center print:hidden bg-[#F9F9F7]/90 backdrop-blur-md shadow-sm">
           <img 
              src={LOGO_URL} 
              alt="Mr & Mrs Egypt" 
              className="h-16 w-auto object-contain"
            />
        </header>
        {/* Increased padding-top to pt-48 to ensure content isn't hidden under header */}
        <main className="pt-32 md:pt-48 p-4 md:p-8">
          <ItineraryDisplay 
            data={itinerary} 
            formData={formData} 
            logoUrl={LOGO_URL} 
            onReset={handleReset} 
          />
        </main>
      </div>
    );
  }

  // DEFAULT VIEW: Landing Page (Header + Wizard Section)
  return (
    <div className="relative min-h-screen w-full font-sans overflow-x-hidden bg-[#F9F9F7]">
      
      {/* 1. HERO HEADER SECTION */}
      <LandingHeader onStart={scrollToWizard} />

      {/* 2. WIZARD SECTION */}
      <section 
        ref={wizardSectionRef} 
        className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden"
      >
        {/* Wizard Background - Updated Gradient Overlay for Light Theme */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${WIZARD_BG})` }}
        >
          {/* Overlay to blend with header - Changed to F9F9F7 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F7] via-[#F9F9F7]/80 to-[#F9F9F7] opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(249,249,247,0.8)_100%)]"></div>
        </div>

        {/* Wizard Content */}
        <div className="relative z-10 w-full max-w-xl">
          <div className="text-center mb-10">
             <h2 className="font-serif text-3xl md:text-4xl text-[#2C3E50] mb-4">Design Your Journey</h2>
             <p className="text-gray-600 font-sans max-w-md mx-auto">
               Complete the steps below to let our AI curators design your preliminary itinerary.
             </p>
          </div>

          <div 
            ref={formContainerRef}
            className={`
              w-full glass-panel rounded-3xl p-6 md:p-10 shadow-xl transition-all duration-500
              ${status === AppStatus.GENERATING ? 'opacity-80 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
            `}
          >
            {status === AppStatus.GENERATING ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-[#C5B097]/20 animate-ping"></div>
                  <Loader2 className="w-16 h-16 text-[#C5B097] animate-spin" />
                </div>
                <h3 className="text-2xl font-serif text-[#2C3E50] mb-2">Crafting Your Journey</h3>
                <p className="text-gray-500 animate-pulse">Our AI specialists are curating your {formData.duration}-day experience...</p>
              </div>
            ) : (
              <>
                <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
                
                <div className="min-h-[320px] mb-8">
                  {renderStepContent()}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  {status === AppStatus.ERROR && !error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center animate-fadeInUp">
                      <p className="text-red-500 text-sm">Something went wrong. Please check your connection and try again.</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {step > 0 ? (
                      <button 
                        onClick={() => setStep(s => s - 1)}
                        className="text-gray-400 hover:text-[#2C3E50] transition-colors text-sm font-medium px-4 py-2"
                      >
                        Back
                      </button>
                    ) : (
                       <div></div>
                    )}

                    <button
                      onClick={handleNext}
                      className="
                        group relative overflow-hidden
                        bg-[#C5B097] text-white
                        px-8 py-3 rounded-full 
                        font-bold tracking-wide 
                        shadow-[0_4px_15px_rgba(197,176,151,0.4)]
                        hover:shadow-[0_4px_25px_rgba(197,176,151,0.6)]
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
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer Gradient */}
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 opacity-20 hidden md:block print:hidden">
           <div className="h-32 bg-gradient-to-t from-[#C5B097]/20 to-transparent"></div>
        </div>
      </section>
    </div>
  );
}
