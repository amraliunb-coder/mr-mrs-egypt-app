import React, { useState, useEffect } from 'react';
import { Download, FileText, Loader2, CheckCircle, X, AlertCircle } from 'lucide-react';

interface PDFGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => Promise<void>;
  travelerName: string;
  tripTitle: string;
}

export function PDFGenerationModal({ isOpen, onClose, onGenerate, travelerName, tripTitle }: PDFGenerationModalProps) {
  const [step, setStep] = useState<'initial' | 'generating' | 'complete' | 'error'>('initial');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('initial');
      setProgress(0);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setStep('generating');
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      console.log('Starting PDF generation from modal...');
      await onGenerate();
      clearInterval(progressInterval);
      setProgress(100);
      setStep('complete');
      console.log('PDF generation completed successfully');
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('PDF Generation Error in Modal:', error);
      
      setStep('error');
      // Provide helpful error messages based on error type
      if (error.message && (error.message.includes('canvas') || error.message.includes('toDataURL') || error.message.includes('rendering'))) {
         setErrorMessage('Unable to render complex elements. Please use the browser print option below for best results.');
      } else if (error.message && error.message.includes('timeout')) {
         setErrorMessage('PDF generation took too long. Try using browser print for large itineraries.');
      } else {
         setErrorMessage(error.message || 'We encountered an issue creating your PDF. Please try the browser print function below.');
      }
    }
  };

  const handleDownload = () => {
    onClose();
    // Reset for next use
    setTimeout(() => {
      setStep('initial');
      setProgress(0);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInUp">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-serif font-bold">Your Egypt Itinerary</h2>
          <p className="text-white/80 text-sm mt-1">{tripTitle}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'initial' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#C5B097]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-[#C5B097]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Ready to Download Your Itinerary?
              </h3>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                We'll create a beautiful PDF of your personalized Egypt itinerary 
                <span className="font-semibold"> "{tripTitle}"</span> for {travelerName}.
              </p>
              <button
                onClick={handleGenerate}
                className="w-full bg-[#C5B097] text-white py-4 rounded-xl font-bold hover:bg-[#B5A087] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <FileText size={20} />
                Generate PDF Itinerary
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Creating Your Perfect Itinerary
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                We're preparing your personalized Egypt travel PDF...
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-[#C5B097] to-[#D5C0A7] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Your Itinerary is Ready!
              </h3>
              <p className="text-gray-600 mb-8 text-sm">
                Your personalized Egypt itinerary PDF has been generated successfully.
              </p>
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Download size={20} />
                Download Itinerary PDF
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Alternative Download Option
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    // Small timeout to allow modal to close before print dialog opens
                    setTimeout(() => window.print(), 300);
                  }}
                  className="w-full bg-[#C5B097] text-white py-4 rounded-xl font-bold hover:bg-[#B5A087] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download size={20} />
                  Open Print Dialog
                </button>
                <button
                  onClick={handleGenerate}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Try PDF Generation Again
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Tip: Use "Save as PDF" in your browser's print dialog
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            This PDF includes your complete itinerary, accommodations, and travel tips
          </p>
        </div>
      </div>
    </div>
  );
}
