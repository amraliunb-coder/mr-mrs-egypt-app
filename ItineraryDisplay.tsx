import React, { useState } from 'react';
import { ItineraryResponse, TravelFormData } from '../types';
import { Download, Calendar, MapPin, Star, Info, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface ItineraryDisplayProps {
  data: ItineraryResponse;
  formData: TravelFormData;
  logoUrl: string;
  onReset: () => void;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ data, formData, logoUrl, onReset }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    
    // We target the specific element ID we want to print
    const element = document.getElementById('itinerary-pdf-content');
    
    if (!element) {
      setIsGeneratingPdf(false);
      return;
    }

    const filename = `${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_Egypt_Itinerary.pdf`;

    const opt = {
      margin: [10, 10, 10, 10], // mm margins [top, left, bottom, right]
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        letterRendering: true 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Strict page breaking
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      // Check if html2pdf is loaded (from index.html script)
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        await (window as any).html2pdf().set(opt).from(element).save();
      } else {
        // Fallback to browser print if library fails/missing
        window.print();
      }
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("There was an error generating the PDF file. Opening print dialog instead.");
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper to parse bold text from markdown (**, *)
  const renderFormattedText = (text: string, className: string = 'font-bold') => {
    if (!text) return null;
    // Splits by **bold** or *bold* patterns
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return (
      <span>
        {parts.map((part, index) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
            const content = part.replace(/\*/g, ''); // Remove asterisks
            return <strong key={index} className={className}>{content}</strong>;
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeInUp pb-20">
      
      {/* Itinerary Document - This is what gets captured */}
      <div 
        id="itinerary-pdf-content"
        className="bg-white text-[#2C3E50] rounded-none md:rounded-lg shadow-xl overflow-hidden print-container relative"
      >
        
        {/* WRAPPER 1: HEADER & HIGHLIGHTS */}
        <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          {/* Header - Cover Page area (LIGHT MODE: White Background) */}
          <div className="bg-white text-[#2C3E50] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-serif text-9xl leading-none select-none pointer-events-none text-black">
              EGYPT
            </div>
            
            <div className="relative z-10">
              {/* Logo on PDF Cover */}
              <div className="mb-8">
                <img 
                  src={logoUrl} 
                  alt="Mr & Mrs Egypt" 
                  className="h-20 w-auto object-contain" 
                  crossOrigin="anonymous" 
                />
              </div>

              <div className="border-b border-[#C5B097] pb-6 mb-6">
                <h1 className="font-serif text-4xl md:text-5xl mb-2 text-[#2C3E50]">{data.tripTitle}</h1>
                <p className="font-script text-[#C5B097] text-2xl">Prepared exclusively for {formData.name}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-sans mb-8">
                 <div>
                   <span className="block text-[#C5B097] uppercase tracking-widest text-xs mb-1">Duration</span>
                   {formData.duration} Days
                 </div>
                 <div>
                   <span className="block text-[#C5B097] uppercase tracking-widest text-xs mb-1">Travelers</span>
                   {formData.groupSize} Guests
                 </div>
                 <div>
                   <span className="block text-[#C5B097] uppercase tracking-widest text-xs mb-1">Style</span>
                   {formData.travelStyle}
                 </div>
                 <div>
                   <span className="block text-[#C5B097] uppercase tracking-widest text-xs mb-1">Start Date</span>
                   {formData.startDate}
                 </div>
              </div>

              {/* ACTION BUTTONS: HIDDEN FROM PDF */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-[#C5B097]/20 no-print" data-html2canvas-ignore>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="bg-[#C5B097] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#B08D55] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button 
                  onClick={onReset}
                  className="flex items-center gap-2 text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors px-4 py-2"
                >
                  <ArrowLeft size={18} />
                  <span>New Itinerary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Body Part 1 */}
          <div className="p-8 md:p-12 print-text-dark bg-white">
            
            {/* Intro */}
            <div className="mb-12">
              <h2 className="font-serif text-2xl text-[#C5B097] mb-4">Your Journey Begins</h2>
              <p className="font-sans text-lg leading-relaxed text-gray-700 mb-6 italic">
                "{data.greeting}"
              </p>
              <p className="font-sans leading-relaxed text-gray-600">
                {data.summary}
              </p>
            </div>

            <hr className="border-[#C5B097]/30 my-8" />

            {/* Highlights */}
            <div className="mb-12">
              <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <Star className="text-[#C5B097]" size={20} /> Trip Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.highlights || []).map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-[#F9F9F7] rounded-lg border border-[#C5B097]/20" style={{ pageBreakInside: 'avoid' }}>
                    <span className="text-[#C5B097] font-serif font-bold text-lg">{idx + 1}.</span>
                    <span className="text-gray-800">
                      {renderFormattedText(highlight, "font-bold text-[#C5B097]")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* WRAPPER 2: DAILY ITINERARY */}
        <div className="p-8 md:p-12 print-text-dark bg-white">
          <div className="mb-12 pt-4">
            <h3 className="font-serif text-xl mb-8 flex items-center gap-2">
              <Calendar className="text-[#C5B097]" size={20} /> Daily Itinerary
            </h3>
            <div className="space-y-8 border-l-2 border-[#C5B097]/20 pl-8 ml-3">
              {(data.days || []).map((day, idx) => (
                <div key={idx} className="relative" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-[#C5B097] text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                    {day.day}
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#2C3E50] mb-2">{day.title}</h4>
                  <ul className="space-y-2 mb-3">
                    {(day.activities || []).map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-[#C5B097] mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C5B097] flex-shrink-0"></span>
                        {renderFormattedText(act)}
                      </li>
                    ))}
                  </ul>
                  {day.notes && (
                    <div className="text-sm text-gray-500 italic flex gap-2 items-start mt-2">
                      <Info size={14} className="mt-1 flex-shrink-0" /> {renderFormattedText(day.notes)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WRAPPER 3: ACCOMMODATIONS */}
        <div className="p-8 md:p-12 print-text-dark bg-white" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div className="mb-12 pt-4">
            <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
              <MapPin className="text-[#C5B097]" size={20} /> Recommended Accommodations
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {(data.accommodationOptions || []).map((hotel, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-6 shadow-sm bg-[#F9F9F7]" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-serif font-bold text-lg text-[#2C3E50]">{hotel.name}</h4>
                    <span className="text-xs bg-[#C5B097]/10 text-[#C5B097] px-2 py-1 rounded uppercase tracking-wider">{hotel.type}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{renderFormattedText(hotel.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WRAPPER 4: NOTES & FOOTER */}
        <div 
          className="bg-[#2C3E50] text-white p-8 md:p-12 rounded-b-lg print:bg-white print:text-black print:border-t print:border-[#C5B097] print:rounded-none"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <h3 className="font-serif text-lg text-[#C5B097] mb-4">Traveler Notes</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {(data.travelTips || []).map((tip, idx) => (
              <li key={idx} className="text-sm text-gray-300 print:text-gray-600 flex gap-2 items-start" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                 <span className="mt-[2px]">•</span> 
                 <span className="flex-1">
                   {renderFormattedText(tip, "font-bold text-white print:text-gray-900")}
                 </span>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-end gap-6 print:border-[#C5B097]/30" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            
            {/* Left: Inclusions List */}
            <div className="w-full md:w-auto text-left order-2 md:order-1">
              <p className="text-xs text-[#C5B097] uppercase tracking-widest mb-3">Price Includes</p>
              <div className="grid grid-cols-1 gap-2">
                 {(data.priceIncludes || []).length > 0 ? (
                    (data.priceIncludes || []).map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/70 print:text-gray-600">
                        <CheckCircle2 size={12} className="text-[#C5B097]" />
                        <span>{inc}</span>
                      </div>
                    ))
                 ) : (
                   // Fallback if older generation without inclusions
                   <span className="text-xs text-white/50 print:text-gray-400">Private Transport, Entry Fees, Domestic Flights & More</span>
                 )}
              </div>
            </div>

            {/* Right: Price & Logo */}
            <div className="w-full md:w-auto text-right order-1 md:order-2">
              <p className="text-sm text-[#C5B097] font-serif mb-1 uppercase tracking-wider">Estimated Price (Per Person)</p>
              <div className="text-3xl font-serif text-white print:text-[#2C3E50] mb-4">
                {data.totalEstimatedCost}
              </div>
              <img 
                src={logoUrl} 
                alt="Mr & Mrs Egypt" 
                className="h-12 w-auto object-contain ml-auto opacity-80" 
                crossOrigin="anonymous" 
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};