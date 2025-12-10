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
  Info,
  FileText
} from 'lucide-react';
import { TravelFormData, ItineraryResponse } from '../types';
import { WhatsAppModal, QuoteModal, EmailModal } from './Modals';
import { PDFGenerationModal } from './PDFGenerationModal';

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
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [isPDFMode, setIsPDFMode] = useState(false);
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
    setTimeout(() => {
        setEmailStatus('sent');
        setTimeout(() => {
            setShowEmailModal(false);
            setEmailStatus('idle');
        }, 2000);
    }, 1500);
  };

  // NEW: Travel-fy style PDF Generation Trigger
  const handleDownloadPDF = () => {
    setShowPDFModal(true);
  };

  // -----------------------------------------------------------
  // ROBUST PDF GENERATION LOGIC
  // -----------------------------------------------------------

  const generatePDF = async () => {
    if (!printRef.current) throw new Error('PDF content not found');
  
    try {
      console.log('=== Starting PDF Generation ===');
      
      // Enable PDF mode for better styling
      setIsPDFMode(true);
      
      // Wait longer for styles to apply and layout to stabilize (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = printRef.current;
      
      console.log('Element dimensions:', element.scrollWidth, 'x', element.scrollHeight);
  
      // Strategy 1: Enhanced html2pdf with proper configuration
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        
        const opt = {
          margin: [0.3, 0.4, 0.3, 0.4], // Balanced margins
          filename: `Egypt-Itinerary-${formData.name.replace(/\s+/g, '-')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 1.5, // slightly higher scale for crisp text
            useCORS: true,
            logging: false,
            letterRendering: true,
            allowTaint: true,
            backgroundColor: '#ffffff', // FORCE WHITE BACKGROUND
            width: element.scrollWidth,
            height: element.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth + 50,
            windowHeight: element.scrollHeight + 50,
            removeContainer: false
          },
          jsPDF: { 
            unit: 'in',
            format: 'a4', 
            orientation: 'portrait',
            compress: true,
            putOnlyUsedFonts: true
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: '.avoid-break'
          }
        };
        
        console.log('Generating PDF with options:', opt);
        
        // Method 1: Using the promise-based approach
        const worker = (window as any).html2pdf().set(opt).from(element);
        
        // Ensure proper save
        const pdfBlob = await worker.outputPdf('blob');
        
        if (pdfBlob.size > 1000) { // Valid PDF size check
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = opt.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('PDF downloaded successfully');
        } else {
          throw new Error('Generated PDF is too small - likely empty');
        }
      } else {
        throw new Error('html2pdf library not available');
      }
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      console.log('Trying fallback method...');
      await generatePDFWithDirectCanvas();
    } finally {
      setIsPDFMode(false);
    }
  };
  
  // Fallback method using direct canvas approach
  const generatePDFWithDirectCanvas = async () => {
    const element = printRef.current;
    if (!element) throw new Error('Element not found');
  
    const html2canvas = (window as any).html2canvas;
    const jsPDF = (window as any).jsPDF;
    
    if (!html2canvas || !jsPDF) {
      throw new Error('Required libraries not available');
    }
  
    // Create canvas
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });
  
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Simple fit strategy for fallback:
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    const filename = `Egypt-Itinerary-${formData.name.replace(/\s+/g, '-')}.pdf`;
    pdf.save(filename);
  };

  const handleEmailWithPDF = async () => {
    await generatePDF();
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 shadow-2xl no-print">
        <button 
          onClick={handleQuoteRequest}
          className="w-full bg-[#C5B097] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#B5A087] transition-all flex items-center justify-center gap-2"
        >
          <Mail size={20} />
          Get Your Final Quote
        </button>
      </div>

      {/* Floating Desktop CTA */}
      <div className="hidden md:block fixed right-8 top-1/2 -translate-y-1/2 z-40 space-y-3 no-print">
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
            className="flex items-center gap-2 bg-gradient-to-r from-[#C5B097] to-[#D5C0A7] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <FileText size={20} />
            <span className="hidden md:inline">Generate PDF</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>

        {/* PDF Container - Main Wrapper */}
        <div 
          ref={printRef} 
          id="itinerary-pdf-content" 
          // REMOVED shadow-xl to fix black background artifact
          className={`bg-white text-[#2C3E50] ${isPDFMode ? 'pdf-generation-active' : 'rounded-2xl shadow-sm border border-gray-200 print-container'}`}
          style={isPDFMode ? {
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            boxShadow: 'none',
            overflow: 'visible',
            backgroundColor: '#ffffff'
          } : {
            maxWidth: '210mm',
            margin: '0 auto',
            background: 'white'
          }}
        >
          <div className="pdf-content-wrapper" style={{ padding: isPDFMode ? '0px' : '0', backgroundColor: '#ffffff' }}>
          
          {/* Hero Header - Enhanced with Cinematic Background */}
          <div 
            data-section="hero-header" 
            className={`relative p-8 md:p-12 page-break-after overflow-hidden ${isPDFMode ? 'text-[#2C3E50]' : 'text-white'}`}
            style={{
              // Use background image for display, but fallback to simple/none for PDF to avoid issues
              backgroundImage: isPDFMode ? 'none' : 'url("https://res.cloudinary.com/drzid08rg/image/upload/q_auto,f_auto/v1764881983/asset-453083520749600768_dbxoap.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlays - Hide in PDF mode */}
            {!isPDFMode && (
              <>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/90 via-[#2C3E50]/40 to-transparent"></div>
              </>
            )}
            
            <div className="relative z-10">
              {/* Logo: Displayed as is (colored) */}
              <img 
                src={logoUrl} 
                alt="Mr & Mrs Egypt" 
                className="h-16 md:h-20 mb-8 object-contain drop-shadow-sm transition-all" 
              />
              
              <h1 className={`text-3xl md:text-5xl font-serif mb-4 leading-tight tracking-tight drop-shadow-md ${isPDFMode ? 'text-[#2C3E50]' : 'text-white'}`}>
                {data.tripTitle}
              </h1>
              
              <p className={`text-xl md:text-2xl mb-8 font-script ${isPDFMode ? 'text-[#C5B097]' : 'text-[#D4AF37]'} drop-shadow-sm`}>
                Curated exclusively for {formData.name}
              </p>
              
              {/* Enhanced Trip Details Grid with Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10">
                {/* Card 1 */}
                <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm transition-shadow ${
                    isPDFMode 
                      ? 'bg-white border-[#C5B097]/10' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}>
                  <div className="flex flex-col items-start gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPDFMode ? 'bg-[#C5B097]/10' : 'bg-white/10'
                    }`}>
                      <Calendar size={20} className={isPDFMode ? 'text-[#C5B097]' : 'text-[#C5B097]'} />
                    </div>
                    <div>
                      <div className={`text-[10px] md:text-xs uppercase tracking-wider font-medium ${
                        isPDFMode ? 'text-gray-500' : 'text-white/70'
                      }`}>Travel Dates</div>
                      <div className={`text-xs md:text-sm font-bold mt-0.5 ${
                        isPDFMode ? 'text-[#2C3E50]' : 'text-white'
                      }`}>{formatDateRange()}</div>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm transition-shadow ${
                    isPDFMode 
                      ? 'bg-white border-[#C5B097]/10' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}>
                  <div className="flex flex-col items-start gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPDFMode ? 'bg-[#C5B097]/10' : 'bg-white/10'
                    }`}>
                      <Clock size={20} className={isPDFMode ? 'text-[#C5B097]' : 'text-[#C5B097]'} />
                    </div>
                    <div>
                      <div className={`text-[10px] md:text-xs uppercase tracking-wider font-medium ${
                        isPDFMode ? 'text-gray-500' : 'text-white/70'
                      }`}>Duration</div>
                      <div className={`text-xs md:text-sm font-bold mt-0.5 ${
                        isPDFMode ? 'text-[#2C3E50]' : 'text-white'
                      }`}>{formData.duration} Days</div>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm transition-shadow ${
                    isPDFMode 
                      ? 'bg-white border-[#C5B097]/10' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}>
                  <div className="flex flex-col items-start gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPDFMode ? 'bg-[#C5B097]/10' : 'bg-white/10'
                    }`}>
                      <Users size={20} className={isPDFMode ? 'text-[#C5B097]' : 'text-[#C5B097]'} />
                    </div>
                    <div>
                      <div className={`text-[10px] md:text-xs uppercase tracking-wider font-medium ${
                        isPDFMode ? 'text-gray-500' : 'text-white/70'
                      }`}>Party Size</div>
                      <div className={`text-xs md:text-sm font-bold mt-0.5 ${
                        isPDFMode ? 'text-[#2C3E50]' : 'text-white'
                      }`}>{formData.groupSize} Guests</div>
                    </div>
                  </div>
                </div>

                {/* Card 4 */}
                <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm transition-shadow ${
                    isPDFMode 
                      ? 'bg-white border-[#C5B097]/10' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}>
                  <div className="flex flex-col items-start gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPDFMode ? 'bg-[#C5B097]/10' : 'bg-white/10'
                    }`}>
                      <Heart size={20} className={isPDFMode ? 'text-[#C5B097]' : 'text-[#C5B097]'} />
                    </div>
                    <div>
                      <div className={`text-[10px] md:text-xs uppercase tracking-wider font-medium ${
                        isPDFMode ? 'text-gray-500' : 'text-white/70'
                      }`}>Experience</div>
                      <div className={`text-xs md:text-sm font-bold mt-0.5 ${
                        isPDFMode ? 'text-[#2C3E50]' : 'text-white'
                      }`}>{formData.tripType}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Summary Section - ADDED BG-WHITE AND FIXED SPACING */}
          <div data-section="summary-section" className="p-8 md:p-12 border-b border-gray-100 avoid-break bg-white">
            <h2 className="text-2xl font-serif text-[#C5B097] mb-6 pt-2">Your Journey Begins</h2>
            
            {/* Added padding-bottom instead of margin-bottom for text to prevent collapse */}
            <div className="pb-8">
              <p className="text-lg text-gray-700 leading-relaxed italic">"{data.greeting}"</p>
            </div>
            
            <div className="pb-8">
              <p className="text-gray-600 leading-relaxed">{data.summary}</p>
            </div>
            
            {/* Budget Display */}
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

          {/* Urgency Banner */}
          {urgency && urgency.show && (
            <div className="p-8 md:px-12 py-6 avoid-break no-print bg-white">
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
          <div data-section="included-section" className="p-8 md:p-12 border-b border-gray-100 avoid-break page-break-before bg-white">
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
                    'Dinners (unless specifically mentioned in itinerary)',
                    'Gratuities',
                    'Travel Insurance',
                    'Personal expenses',
                    'Optional experiences not listed in itinerary'
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
            <div data-section="highlights-section" className="p-8 md:p-12 border-b border-gray-100 avoid-break page-break-before bg-white">
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
          <div data-section="itinerary-section" className="p-8 md:p-12 border-b border-gray-100 bg-[#FBFBFB] page-break-before">
            <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-8 flex items-center gap-3">
              <Calendar className="text-[#C5B097]" size={24} /> Daily Itinerary
            </h2>
            
            <div className="space-y-8 border-l-2 border-[#C5B097]/20 pl-8 ml-3">
              {data.days.map((day, idx) => (
                <div key={idx} className="relative avoid-break day-item">
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

          {/* Generate PDF CTA - Travel-fy Style - HIDDEN IN PDF */}
          <div className="p-8 md:p-12 border-b border-gray-100 avoid-break no-print bg-white">
            <div className="bg-gradient-to-br from-[#2C3E50] to-[#34495E] rounded-2xl p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5B097]/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#C5B097]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-[#C5B097]" />
                </div>
                <h3 className="text-2xl font-serif mb-3 text-[#C5B097]">
                  Save Your Itinerary
                </h3>
                <p className="text-white/80 mb-6 max-w-xl mx-auto">
                  Get a beautifully designed PDF of your complete Egypt itinerary to share, print, or reference later.
                </p>
                <button 
                  onClick={handleDownloadPDF}
                  className="bg-[#C5B097] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#B5A087] transition-all shadow-lg text-base flex items-center justify-center gap-2 mx-auto"
                >
                  <FileText size={20} />
                  Generate PDF Itinerary
                </button>
              </div>
            </div>
          </div>

          {/* Mid-Itinerary CTA - HIDDEN IN PDF */}
          <div className="p-8 md:p-12 border-b border-gray-100 avoid-break no-print bg-white">
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

          {/* Accommodations */}
          {data.accommodationOptions && data.accommodationOptions.length > 0 && (
            <div data-section="accommodation-section" className="p-8 md:p-12 border-b border-gray-100 avoid-break page-break-before bg-white">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-6 flex items-center gap-3">
                <MapPin className="text-[#C5B097]" size={24} /> Recommended Stays
              </h2>
              <div className="grid gap-6">
                {data.accommodationOptions.map((acc, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
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
            <div data-section="tips-section" className="p-8 md:p-12 border-b border-gray-100 avoid-break page-break-before bg-white">
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
      <PDFGenerationModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onGenerate={generatePDF}
        travelerName={formData.name}
        tripTitle={data.tripTitle}
      />
    </>
  );
}
