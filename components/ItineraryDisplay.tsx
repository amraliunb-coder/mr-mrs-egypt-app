import React, { useState, useRef } from 'react';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  Star,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  Shield,
  Heart,
  Info
} from 'lucide-react';
import { TravelFormData, ItineraryResponse } from '../types';
import { WhatsAppModal, QuoteModal, EmailModal } from './Modals';

interface ItineraryDisplayProps {
  data: ItineraryResponse;
  formData: TravelFormData;
  logoUrl: string;
  onReset: () => void;
}

export function ItineraryDisplay({ data, formData, logoUrl, onReset }: ItineraryDisplayProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate booking urgency
  const getBookingUrgency = () => {
    if (!formData.startDate) return null;
    
    const today = new Date();
    const tripDate = new Date(formData.startDate);
    const monthsAway = Math.floor((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsAway >= 3 && monthsAway <= 9) {
      return {
        show: true,
        monthsAway,
        message: monthsAway <= 5 ? 'high' : 'medium'
      };
    }
    return null;
  };

  const urgency = getBookingUrgency();

  // WhatsApp handler with device detection
  const handleWhatsAppClick = () => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const phone = "201022106120";
    const message = encodeURIComponent(
      `Hi! I'd like to discuss my ${formData.duration}-day Egypt itinerary for ${formData.name}. Travel dates: ${formData.startDate}`
    );
    
    if (isMobile) {
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      setShowWhatsAppModal(true);
    }
  };

  // Quote request handler
  const handleQuoteRequest = () => {
    setShowQuoteModal(true);
  };

  const submitQuoteRequest = (e: React.FormEvent) => {
    // This prop is required by interface but logic is handled inside QuoteModal for email trigger
    // We keep it as a no-op or simple logger to satisfy TypeScript
    e.preventDefault();
    console.log('Quote request submitted via modal internal logic');
  };

  // Email Itinerary Handler
  const handleEmailItinerary = () => {
    setShowEmailModal(true);
  };

  const submitEmailRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus('sending');
    // Simulate email send
    setTimeout(() => {
        setEmailStatus('sent');
        setTimeout(() => {
            setShowEmailModal(false);
            setEmailStatus('idle');
        }, 2000);
    }, 1500);
  };

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      if (typeof window !== 'undefined' && (window as any).html2pdf && printRef.current) {
        const element = printRef.current;
        
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `Egypt-Itinerary-${formData.name.replace(/\s+/g, '-')}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break',
            after: '.page-break-after',
            avoid: '.avoid-break'
          }
        };
        
        await (window as any).html2pdf().set(opt).from(element).save();
      } else {
        // Fallback to browser print dialog
        window.print();
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try using the print function (Ctrl+P / Cmd+P)');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailWithPDF = async () => {
    // 1. Trigger PDF Download
    await handleDownloadPDF();
    
    // 2. Small delay to let download start
    setTimeout(() => {
      alert("Please attach the downloaded PDF to the email that will open next.");
      
      const subject = encodeURIComponent(`Itinerary Inquiry - ${formData.name} - ${formData.duration} Days`);
      const bodyContent = `Hello,\n\nI would like to discuss and finalize my personalized Egypt itinerary.\n\nTRAVELER DETAILS:\nName: ${formData.name}\nDuration: ${formData.duration} days\nStart Date: ${formData.startDate}\nGroup Size: ${formData.groupSize}\n\n(I have attached the generated PDF itinerary)`;
      
      window.location.href = `mailto:info@mrandmrsegypt.com?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;
    }, 1500);
  };

  // Format date range
  const formatDateRange = () => {
    if (!formData.startDate) return '';
    const start = new Date(formData.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(formData.duration));
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return (
      <span>
        {parts.map((part, index) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
            const content = part.replace(/\*/g, '');
            return <strong key={index} className="font-bold">{content}</strong>;
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <>
      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 shadow-2xl no-print">
        <button 
          onClick={handleQuoteRequest}
          className="w-full bg-[#C5B097] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#B5A087] transition-all flex items-center justify-center gap-2"
        >
          <Mail size={20} />
          Get Your Final Quote
        </button>
      </div>

      {/* Floating Desktop CTA */}
      <div className="hidden md:block fixed right-8 top-1/2 -translate-y-1/2 z-50 space-y-3 no-print">
        <button 
          onClick={handleQuoteRequest}
          className="bg-[#C5B097] text-white px-6 py-4 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-2 font-bold"
        >
          <Mail size={20} />
          Get Quote
        </button>
        <button 
          onClick={handleWhatsAppClick}
          className="bg-[#25D366] text-white px-6 py-4 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-2 font-bold"
        >
          <MessageCircle size={20} />
          WhatsApp
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto pb-32 md:pb-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8 no-print">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-colors"
          >
            <RefreshCw size={18} />
            <span className="hidden md:inline">Start Over</span>
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span className="hidden md:inline">
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </span>
          </button>
        </div>

        {/* PDF Container */}
        <div ref={printRef} id="itinerary-pdf-content" className="print-container bg-white rounded-2xl shadow-xl overflow-hidden text-[#2C3E50]">
          
          {/* Hero Header - Cinematic Image Background */}
          <div 
            data-section="hero-header"
            className="relative p-8 md:p-12 overflow-hidden print:bg-white print:text-[#2C3E50] text-white"
          >
            {/* Background Image - Screen Only */}
            <div className="absolute inset-0 z-0 print:hidden">
              <img 
                src="https://res.cloudinary.com/drzid08rg/image/upload/q_auto,f_auto/v1764881983/asset-453083520749600768_dbxoap.jpg" 
                alt="Egypt Landscape" 
                className="w-full h-full object-cover object-center"
              />
              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a252f] via-[#2C3E50]/80 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a252f] via-transparent to-transparent"></div>
            </div>

            {/* Background Decoration - PDF/Print Only */}
            <div className="hidden print:block absolute top-0 right-0 w-64 h-64 bg-[#C5B097]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <img 
                src={logoUrl} 
                alt="Mr & Mrs Egypt" 
                className="h-16 md:h-20 mb-6 object-contain drop-shadow-lg" 
              />
              
              <h1 className="text-3xl md:text-5xl font-serif mb-3 leading-tight text-white print:text-[#2C3E50] drop-shadow-md">
                {data.tripTitle}
              </h1>
              
              <p className="text-xl md:text-2xl text-[#C5B097] mb-8 font-script print:text-[#C5B097] drop-shadow-sm">
                Curated exclusively for {formData.name}
              </p>
              
              {/* Trip Details Grid - Glassmorphism on Screen, Clean on Print */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-4">
                
                {/* Card 1: Dates */}
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-white/40 hover:shadow-xl cursor-default print:bg-transparent print:border-[#C5B097]/20 print:shadow-none print:p-0 print:transform-none">
                  <div className="flex flex-col items-start gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#C5B097]/20 flex items-center justify-center print:bg-[#C5B097]/10 group-hover:bg-[#C5B097]/30 transition-colors">
                      <Calendar size={20} className="text-[#F0EDE5] print:text-[#C5B097]" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium print:text-gray-500">Travel Dates</div>
                      <div className="text-sm font-bold text-white mt-0.5 print:text-[#2C3E50]">{formatDateRange()}</div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Duration */}
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-white/40 hover:shadow-xl cursor-default print:bg-transparent print:border-[#C5B097]/20 print:shadow-none print:p-0 print:transform-none">
                  <div className="flex flex-col items-start gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#C5B097]/20 flex items-center justify-center print:bg-[#C5B097]/10 group-hover:bg-[#C5B097]/30 transition-colors">
                      <Clock size={20} className="text-[#F0EDE5] print:text-[#C5B097]" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium print:text-gray-500">Duration</div>
                      <div className="text-sm font-bold text-white mt-0.5 print:text-[#2C3E50]">{formData.duration} Days</div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Party Size */}
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-white/40 hover:shadow-xl cursor-default print:bg-transparent print:border-[#C5B097]/20 print:shadow-none print:p-0 print:transform-none">
                  <div className="flex flex-col items-start gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#C5B097]/20 flex items-center justify-center print:bg-[#C5B097]/10 group-hover:bg-[#C5B097]/30 transition-colors">
                      <Users size={20} className="text-[#F0EDE5] print:text-[#C5B097]" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium print:text-gray-500">Party Size</div>
                      <div className="text-sm font-bold text-white mt-0.5 print:text-[#2C3E50]">{formData.groupSize} Guests</div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Experience */}
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-white/40 hover:shadow-xl cursor-default print:bg-transparent print:border-[#C5B097]/20 print:shadow-none print:p-0 print:transform-none">
                  <div className="flex flex-col items-start gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#C5B097]/20 flex items-center justify-center print:bg-[#C5B097]/10 group-hover:bg-[#C5B097]/30 transition-colors">
                      <Heart size={20} className="text-[#F0EDE5] print:text-[#C5B097]" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium print:text-gray-500">Experience</div>
                      <div className="text-sm font-bold text-white mt-0.5 print:text-[#2C3E50]">{formData.tripType}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="p-8 md:p-12 border-b border-gray-100 avoid-break">
            <h2 className="text-2xl font-serif text-[#C5B097] mb-4">Your Journey Begins</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8 italic">"{data.greeting}"</p>
            <p className="text-gray-600 leading-relaxed mb-0">{data.summary}</p>
          </div>

          {/* Urgency Banner */}
          {urgency && urgency.show && (
            <div className="p-8 md:px-12 py-6 avoid-break no-print">
              <div className={`rounded-xl p-4 ${urgency.message === 'high' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={urgency.message === 'high' ? 'text-amber-600' : 'text-blue-600'} size={20} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${urgency.message === 'high' ? 'text-amber-900' : 'text-blue-900'}`}>
                      Peak Season Notice
                    </p>
                    <p className={`text-sm mt-1 ${urgency.message === 'high' ? 'text-amber-800' : 'text-blue-800'}`}>
                      Your travel dates are {urgency.monthsAway} months away. Premium hotels in Cairo and Luxor sell out quickly. Booking now secures availability and current rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What's Included Section */}
          <div className="p-8 md:p-12 border-b border-gray-100 avoid-break">
            <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-8 text-center">
              Your Investment Includes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Included */}
              <div>
                <h3 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <CheckCircle size={18} className="text-[#C5B097]" />
                  Included
                </h3>
                <ul className="space-y-3">
                  {(data.priceIncludes || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C5B097] mt-1.5 shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                  {(!data.priceIncludes || data.priceIncludes.length === 0) && (
                    <>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5B097] mt-1.5 shrink-0"></div>
                        <span>All accommodations ({formData.duration} nights)</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5B097] mt-1.5 shrink-0"></div>
                        <span>Private transportation</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5B097] mt-1.5 shrink-0"></div>
                        <span>Expert guides</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5B097] mt-1.5 shrink-0"></div>
                        <span>Entrance fees</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Not Included */}
              <div>
                <h3 className="font-bold text-gray-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  Not Included
                </h3>
                <ul className="space-y-3">
                  {[
                    'International flights',
                    'Entry Visa ($25 USD)',
                    'Lunches & Dinners (unless specified)',
                    'Gratuities',
                    'Travel Insurance'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {data.highlights && data.highlights.length > 0 && (
            <div className="p-8 md:p-12 border-b border-gray-100 avoid-break">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-6 flex items-center gap-3">
                <Star className="text-[#C5B097]" size={24} /> Trip Highlights
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-[#F9F9F7] border border-gray-100">
                    <span className="text-[#C5B097] font-serif font-bold text-lg">{idx + 1}.</span>
                    <span className="text-gray-700 text-sm leading-relaxed">{renderFormattedText(highlight)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day by Day Itinerary */}
          <div className="p-8 md:p-12 border-b border-gray-100 bg-[#FBFBFB]">
            <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-8 flex items-center gap-3">
              <Calendar className="text-[#C5B097]" size={24} /> Daily Itinerary
            </h2>
            
            <div className="space-y-8 border-l-2 border-[#C5B097]/20 pl-8 ml-3">
              {data.days.map((day, idx) => (
                <div key={idx} className="relative avoid-break">
                  <div className="absolute -left-[43px] top-0 w-8 h-8 rounded-full bg-[#C5B097] text-white flex items-center justify-center font-bold text-sm ring-4 ring-[#FBFBFB]">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-[#2C3E50] mb-3">{day.title}</h3>
                    <ul className="space-y-3 mb-4">
                      {day.activities.map((activity, actIdx) => (
                        <li key={actIdx} className="flex items-start gap-3 text-gray-700 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                          <span className="leading-relaxed">{renderFormattedText(activity)}</span>
                        </li>
                      ))}
                    </ul>
                    {day.notes && (
                      <div className="flex gap-2 items-start text-sm text-gray-500 italic bg-white p-3 rounded border border-gray-100">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p>{day.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mid-Itinerary CTA */}
          <div className="p-8 md:p-12 border-b border-gray-100 avoid-break no-print">
            <div className="bg-[#2C3E50] rounded-2xl p-8 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-serif mb-3 text-[#C5B097]">
                  Want to Customize This?
                </h3>
                <p className="text-white/80 mb-6 max-w-xl mx-auto">
                  Add extra days in Luxor, swap beach time for desert adventures, or upgrade accommodations—our specialists make it happen.
                </p>
                <button 
                  onClick={handleQuoteRequest}
                  className="bg-[#C5B097] text-white px-8 py-3 rounded-full font-bold hover:bg-[#B5A087] transition-all shadow-lg text-sm uppercase tracking-widest"
                >
                  Speak to a Specialist
                </button>
              </div>
            </div>
          </div>

          {/* Estimated Investment Section - Moved here */}
          <div className="p-8 md:p-12 border-b border-gray-100 avoid-break">
            <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-6 flex items-center gap-3">
               <DollarSign className="text-[#C5B097]" size={24} /> Investment
            </h2>
            <div className="bg-[#F9F9F7] rounded-xl p-6 border border-[#C5B097]/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Estimated Investment</div>
                <div className="text-3xl font-serif text-[#2C3E50]">{data.totalEstimatedCost}</div>
                <div className="text-xs text-gray-400 mt-1">Per person • Excluding international flights</div>
              </div>
              <div className="w-12 h-12 bg-[#C5B097]/10 rounded-full flex items-center justify-center">
                <DollarSign size={24} className="text-[#C5B097]" />
              </div>
            </div>
          </div>

          {/* Accommodations */}
          {data.accommodationOptions && data.accommodationOptions.length > 0 && (
            <div className="p-8 md:p-12 border-b border-gray-100 avoid-break">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-6 flex items-center gap-3">
                <MapPin className="text-[#C5B097]" size={24} /> Recommended Stays
              </h2>
              <div className="grid gap-6">
                {data.accommodationOptions.map((acc, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                      <h3 className="text-lg font-bold text-[#2C3E50]">{acc.name}</h3>
                      <span className="text-xs text-[#C5B097] bg-[#C5B097]/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider w-fit">{acc.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{renderFormattedText(acc.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {data.travelTips && data.travelTips.length > 0 && (
            <div className="p-8 md:p-12 border-b border-gray-100 avoid-break">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-6">Expert Tips</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.travelTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-[#F9F9F7] p-4 rounded-lg">
                    <Shield size={18} className="text-[#C5B097] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{renderFormattedText(tip)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process & CTA Section */}
          <div className="p-8 md:p-12 bg-[#F9F9F7] avoid-break">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-3">
                Love This Itinerary?
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
                Every journey is uniquely crafted. Let's discuss your preferences, finalize pricing, 
                and ensure every detail is perfect.
              </p>
            </div>
            
            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { title: 'Refine', desc: 'Tell us what to adjust' },
                { title: 'Quote', desc: 'Get final pricing in 24h' },
                { title: 'Book', desc: 'Secure with a deposit' }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-[#C5B097] text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{i+1}</div>
                  <h4 className="font-bold text-[#2C3E50]">{step.title}</h4>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA Buttons */}
            <div className="flex flex-col gap-4 max-w-md mx-auto no-print">
              <button 
                onClick={handleQuoteRequest}
                className="w-full bg-[#C5B097] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#B5A087] transition-all flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Get Your Final Quote
              </button>
              
              <button 
                onClick={handleWhatsAppClick}
                className="w-full bg-white border-2 border-[#25D366] text-[#25D366] py-3 rounded-full font-bold hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Chat on WhatsApp
              </button>
              
              <button 
                onClick={handleEmailWithPDF}
                className="w-full bg-transparent text-gray-500 py-2 text-sm hover:text-[#2C3E50] transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                Email Me This Itinerary
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center opacity-60">
               <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
               <p className="text-xs text-gray-400">© 2024 Mr & Mrs Egypt</p>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <WhatsAppModal 
        isOpen={showWhatsAppModal} 
        onClose={() => setShowWhatsAppModal(false)} 
        formData={formData} 
      />
      <EmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        formData={formData} 
        status={emailStatus} 
        onSubmit={submitEmailRequest} 
      />
      <QuoteModal 
        isOpen={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)} 
        formData={formData} 
        onSubmit={submitQuoteRequest} 
      />
    </>
  );
}
