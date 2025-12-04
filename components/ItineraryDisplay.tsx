import React, { useState } from 'react';
import { ItineraryResponse, TravelFormData } from '../types';
import { Download, Calendar, MapPin, Star, Info, ArrowLeft, Loader2, CheckCircle2, Sparkles, Users, Clock } from 'lucide-react';

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
    
    const element = document.getElementById('itinerary-pdf-content');
    
    if (!element) {
      setIsGeneratingPdf(false);
      return;
    }

    const filename = `${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_Egypt_Itinerary.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        letterRendering: true 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        await (window as any).html2pdf().set(opt).from(element).save();
      } else {
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

  const renderFormattedText = (text: string, className: string = 'font-bold') => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return (
      <span>
        {parts.map((part, index) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
            const content = part.replace(/\*/g, '');
            return <strong key={index} className={className}>{content}</strong>;
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeInUp pb-20">
      
      {/* Itinerary Document */}
      <div 
        id="itinerary-pdf-content"
        className="bg-white text-[#2C3E50] rounded-none md:rounded-2xl shadow-2xl overflow-hidden print-container relative border border-gray-100"
      >
        
        {/* HERO HEADER SECTION */}
        <div className="relative bg-gradient-to-br from-[#2C3E50] via-[#34495e] to-[#2C3E50] text-white overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Gold Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5B097] to-transparent"></div>

          <div className="relative z-10 p-8 md:p-16">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src={logoUrl} 
                alt="Mr & Mrs Egypt" 
                className="h-16 w-auto object-contain opacity-90" 
                crossOrigin="anonymous" 
              />
            </div>

            {/* Title Section */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#C5B097]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-[#C5B097]/30">
                <Sparkles size={16} className="text-[#C5B097]" />
                <span className="text-[#C5B097] text-sm font-medium tracking-wider uppercase">Bespoke Journey</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl mb-3 text-white leading-tight">{data.tripTitle}</h1>
              <p className="font-script text-[#C5B097] text-2xl md:text-3xl">For {formData.name}</p>
            </div>
            
            {/* Trip Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-[#C5B097]" />
                  <span className="text-[#C5B097] uppercase tracking-widest text-xs font-semibold">Duration</span>
                </div>
                <p className="text-white font-medium">{formData.duration} Days</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-[#C5B097]" />
                  <span className="text-[#C5B097] uppercase tracking-widest text-xs font-semibold">Travelers</span>
                </div>
                <p className="text-white font-medium">{formData.groupSize} Guests</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-[#C5B097]" />
                  <span className="text-[#C5B097] uppercase tracking-widest text-xs font-semibold">Style</span>
                </div>
                <p className="text-white font-medium text-sm">{formData.travelStyle.split(' ')[0]}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-[#C5B097]" />
                  <span className="text-[#C5B097] uppercase tracking-widest text-xs font-semibold">Starts</span>
                </div>
                <p className="text-white font-medium text-sm">{formData.startDate}</p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10 no-print" data-html2canvas-ignore>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="group bg-[#C5B097] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#B08D55] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download Itinerary</span>
                  </>
                )}
              </button>
              <button 
                onClick={onReset}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-6 py-3 rounded-full hover:bg-white/5"
              >
                <ArrowLeft size={18} />
                <span>Create New Journey</span>
              </button>
            </div>
          </div>

          {/* Bottom Wave Decoration */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 md:h-12">
              <path d="M0,0 L0,60 Q300,90 600,60 T1200,60 L1200,0 Z" fill="white"></path>
            </svg>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="bg-white">
          
          {/* Welcome Message */}
          <div className="px-8 md:px-16 pt-12 pb-8" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#C5B097]/10 flex items-center justify-center">
                <Sparkles className="text-[#C5B097]" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-2xl text-[#2C3E50] mb-3">Welcome to Your Journey</h2>
                <p className="font-sans text-lg leading-relaxed text-gray-700 italic border-l-4 border-[#C5B097] pl-4 py-2 bg-[#F9F9F7]">
                  "{data.greeting}"
                </p>
              </div>
            </div>
            <p className="font-sans leading-relaxed text-gray-600 text-base">
              {data.summary}
            </p>
          </div>

          <div className="px-8 md:px-16">
            <div className="h-px bg-gradient-to-r from-transparent via-[#C5B097]/30 to-transparent"></div>
          </div>

          {/* Highlights Section */}
          <div className="px-8 md:px-16 py-12" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="flex items-center gap-3 mb-8">
              <Star className="text-[#C5B097]" size={28} />
              <h3 className="font-serif text-3xl text-[#2C3E50]">Journey Highlights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.highlights || []).map((highlight, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-gradient-to-br from-[#F9F9F7] to-white p-5 rounded-xl border border-[#C5B097]/20 hover:border-[#C5B097]/40 transition-all hover:shadow-md"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C5B097]/10 flex items-center justify-center font-serif text-[#C5B097] font-bold text-lg">
                      {idx + 1}
                    </div>
                    <p className="text-gray-800 leading-relaxed flex-1 pt-1">
                      {renderFormattedText(highlight, "font-bold text-[#C5B097]")}
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#C5B097]/5 rounded-full blur-2xl -z-10 group-hover:bg-[#C5B097]/10 transition-all"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Itinerary */}
          <div className="px-8 md:px-16 py-12 bg-gradient-to-b from-white to-[#F9F9F7]">
            <div className="flex items-center gap-3 mb-10">
              <Calendar className="text-[#C5B097]" size={28} />
              <h3 className="font-serif text-3xl text-[#2C3E50]">Day-by-Day Itinerary</h3>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C5B097] via-[#C5B097]/50 to-transparent hidden md:block"></div>
              
              <div className="space-y-8">
                {(data.days || []).map((day, idx) => (
                  <div 
                    key={idx} 
                    className="relative pl-0 md:pl-16"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    {/* Day Number Badge */}
                    <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#C5B097] to-[#B08D55] text-white flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-white hidden md:flex">
                      {day.day}
                    </div>

                    {/* Day Card */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495e] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="md:hidden w-8 h-8 rounded-full bg-[#C5B097] text-white flex items-center justify-center font-bold text-sm">
                            {day.day}
                          </span>
                          <h4 className="font-serif text-xl font-bold text-white flex-1">{day.title}</h4>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <ul className="space-y-3">
                          {(day.activities || []).map((act, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700">
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C5B097] mt-2"></div>
                              <span className="flex-1 leading-relaxed">{renderFormattedText(act)}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {day.notes && (
                          <div className="mt-5 pt-5 border-t border-gray-100">
                            <div className="flex gap-3 items-start bg-[#C5B097]/5 rounded-lg p-4">
                              <Info size={18} className="text-[#C5B097] flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-600 italic leading-relaxed">
                                {renderFormattedText(day.notes)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accommodations */}
          <div className="px-8 md:px-16 py-12 bg-white" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="text-[#C5B097]" size={28} />
              <h3 className="font-serif text-3xl text-[#2C3E50]">Luxury Accommodations</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {(data.accommodationOptions || []).map((hotel, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-gradient-to-br from-white to-[#F9F9F7] rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5B097]/5 rounded-full blur-3xl -z-10"></div>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                    <h4 className="font-serif font-bold text-xl text-[#2C3E50] flex-1">{hotel.name}</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#C5B097]/10 text-[#C5B097] uppercase tracking-wider font-bold border border-[#C5B097]/20">
                      {hotel.type}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{renderFormattedText(hotel.description)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Section */}
          <div 
            className="bg-gradient-to-br from-[#2C3E50] to-[#34495e] text-white px-8 md:px-16 py-12 print:bg-white print:text-black print:border-t print:border-[#C5B097]"
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Travel Tips */}
              <div>
                <h3 className="font-serif text-xl text-[#C5B097] mb-4 flex items-center gap-2">
                  <Info size={20} />
                  Essential Information
                </h3>
                <ul className="grid grid-cols-1 gap-3">
                  {(data.travelTips || []).map((tip, idx) => (
                    <li 
                      key={idx} 
                      className="text-sm text-gray-300 print:text-gray-600 flex gap-2 items-start"
                      style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                    >
                      <span className="text-[#C5B097] mt-1">•</span>
                      <span className="flex-1">
                        {renderFormattedText(tip, "font-bold text-white print:text-gray-900")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Includes */}
              <div>
                <h3 className="font-serif text-xl text-[#C5B097] mb-4">Investment Includes</h3>
                <div className="space-y-2">
                  {(data.priceIncludes || []).length > 0 ? (
                    (data.priceIncludes || []).map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/80 print:text-gray-600">
                        <CheckCircle2 size={16} className="text-[#C5B097] flex-shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-white/50 print:text-gray-400">
                      Comprehensive package details available upon inquiry
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 print:border-[#C5B097]/30 flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Price */}
              <div className="text-center md:text-left">
                <p className="text-sm text-[#C5B097] font-medium mb-1 uppercase tracking-wider">Investment Per Person</p>
                <div className="text-4xl font-serif text-white print:text-[#2C3E50]">
                  {data.totalEstimatedCost}
                </div>
              </div>

              {/* Logo */}
              <div>
                <img 
                  src={logoUrl} 
                  alt="Mr & Mrs Egypt" 
                  className="h-14 w-auto object-contain opacity-80" 
                  crossOrigin="anonymous" 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
