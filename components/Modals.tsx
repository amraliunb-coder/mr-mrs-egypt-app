import React, { useState } from 'react';
import { X, MessageCircle, Mail, Send, CheckCircle, Loader2, Smartphone, Monitor } from 'lucide-react';
import { TravelFormData } from '../types';

// ============================================================================
// BASE MODAL WRAPPER
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  maxWidth?: string;
}

function Modal({ isOpen, onClose, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeInUp">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} className="text-gray-600" />
        </button>
        
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// WHATSAPP MODAL (Desktop Users)
// ============================================================================

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TravelFormData;
}

export function WhatsAppModal({ isOpen, onClose, formData }: WhatsAppModalProps) {
  const phone = "201022106120";
  const message = encodeURIComponent(
    `Hi! I'd like to discuss my ${formData.duration}-day Egypt itinerary for ${formData.name}. Travel dates: ${formData.startDate}`
  );
  const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
  const whatsappDirectUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={40} className="text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif text-[#2C3E50] mb-3">
          Connect on WhatsApp
        </h2>
        <p className="text-gray-600 mb-8">
          Choose how you'd like to continue the conversation
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* WhatsApp Web */}
          <a
            href={whatsappWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#25D366]/10 rounded-lg flex items-center justify-center transition-colors">
              <Monitor size={24} className="text-gray-600 group-hover:text-[#25D366]" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-[#2C3E50]">WhatsApp Web</div>
              <div className="text-sm text-gray-500">Continue on this computer</div>
            </div>
          </a>

          {/* Mobile WhatsApp */}
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#25D366]/10 rounded-lg flex items-center justify-center transition-colors">
              <Smartphone size={24} className="text-gray-600 group-hover:text-[#25D366]" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-[#2C3E50]">Mobile App</div>
              <div className="text-sm text-gray-500">Open in WhatsApp app</div>
            </div>
          </a>
        </div>

        {/* QR Code Placeholder */}
        <div className="bg-gray-50 rounded-xl p-6 mb-4">
          <div className="w-40 h-40 mx-auto bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs text-gray-500">Scan to chat<br/>on mobile</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Or call/text: <strong className="text-[#2C3E50]">+20 102 210 6120</strong>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500">
          Our specialists typically respond within 2 hours during business hours
        </p>
      </div>
    </Modal>
  );
}

// ============================================================================
// EMAIL ITINERARY MODAL
// ============================================================================

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TravelFormData;
  status: 'idle' | 'sending' | 'sent';
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailModal({ isOpen, onClose, formData, status, onSubmit }: EmailModalProps) {
  const [preferences, setPreferences] = useState({
    travelTips: true,
    specialOffers: true,
    egyptGuides: true
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-8">
        {status === 'sent' ? (
          // Success State
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-serif text-[#2C3E50] mb-3">
              Check Your Inbox!
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent your personalized itinerary to <strong>{formData.email}</strong>
            </p>
            <div className="bg-[#F9F9F7] rounded-xl p-4 mb-6 text-sm text-gray-700">
              <p className="mb-2">📬 <strong>What's next?</strong></p>
              <ul className="text-left space-y-1 ml-6 text-gray-600">
                <li>• Your itinerary PDF is on its way</li>
                <li>• We'll follow up in 2-3 days with insider tips</li>
                <li>• Reply anytime to discuss customizations</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="bg-[#C5B097] text-white px-8 py-3 rounded-full font-bold hover:bg-[#B5A087] transition-all"
            >
              Got It!
            </button>
          </div>
        ) : (
          // Form State
          <>
            {/* Icon */}
            <div className="w-16 h-16 bg-[#C5B097]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={32} className="text-[#C5B097]" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-serif text-[#2C3E50] mb-2 text-center">
              Save This Itinerary
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We'll email your personalized {formData.duration}-day Egypt itinerary plus exclusive travel insights
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email (Pre-filled from form) */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#2C3E50] shadow-sm"
                />
              </div>

              {/* Preferences */}
              <div className="bg-[#F9F9F7] rounded-xl p-4">
                <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                  📬 Also Send Me (Optional)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.travelTips}
                      onChange={(e) => setPreferences({...preferences, travelTips: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-[#C5B097] focus:ring-[#C5B097]"
                    />
                    <span className="text-sm text-gray-700">Essential Egypt travel tips</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.specialOffers}
                      onChange={(e) => setPreferences({...preferences, specialOffers: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-[#C5B097] focus:ring-[#C5B097]"
                    />
                    <span className="text-sm text-gray-700">Exclusive booking offers</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.egyptGuides}
                      onChange={(e) => setPreferences({...preferences, egyptGuides: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-[#C5B097] focus:ring-[#C5B097]"
                    />
                    <span className="text-sm text-gray-700">Free destination guides & maps</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-[#C5B097] text-white py-4 rounded-full font-bold text-lg hover:bg-[#B5A087] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Email My Itinerary
                  </>
                )}
              </button>

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 text-center">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}

// ============================================================================
// QUOTE REQUEST MODAL (High Commitment)
// ============================================================================

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TravelFormData;
  onSubmit: (e: React.FormEvent) => void;
}

export function QuoteModal({ isOpen, onClose, formData, onSubmit }: QuoteModalProps) {
  const [customization, setCustomization] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const subject = encodeURIComponent(`Booking Enquiry - ${formData.name} - ${formData.startDate}`);
    const body = encodeURIComponent(`
Booking Enquiry

TRAVELER DETAILS
----------------
Name: ${formData.name}
Email: ${formData.email}
Phone: ${phone || 'Not provided'}
Country: ${formData.country}

TRIP DETAILS
------------
Start Date: ${formData.startDate}
Duration: ${formData.duration} Days
Travelers: ${formData.groupSize} (${formData.hasChildren ? 'With Children' : 'Adults Only'})
Trip Type: ${formData.tripType}
Budget: ${formData.budgetRange}
Travel Style: ${formData.travelStyle}

CUSTOMIZATION REQUESTS / NOTES
------------------------------
${customization || 'None provided'}

Additional Notes from Initial Form:
${formData.additionalNotes || 'None'}
    `.trim());

    // Use a small timeout to simulate processing before opening mail client
    setTimeout(() => {
        window.location.href = `mailto:info@mrandmrsegypt.com?subject=${subject}&body=${body}`;
        setStatus('sent');
        setTimeout(() => {
            onClose();
            setStatus('idle');
        }, 2000);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-8">
        {status === 'sent' ? (
          // Success State
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-serif text-[#2C3E50] mb-3">
              Opening Email...
            </h2>
            <p className="text-gray-600 mb-6">
              Your email client should open shortly with your booking details.
            </p>
            <div className="bg-[#F9F9F7] rounded-xl p-4 text-sm text-gray-700">
              <p className="mb-2">📋 <strong>What happens next?</strong></p>
              <ul className="text-left space-y-1 ml-6 text-gray-600">
                <li>• Review the pre-filled email</li>
                <li>• Attach the PDF itinerary (optional but recommended)</li>
                <li>• Click Send</li>
                <li>• Our team will reply within 24 hours</li>
              </ul>
            </div>
          </div>
        ) : (
          // Form State
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C3E50] mb-2">
                Get Your Final Quote
              </h2>
              <p className="text-gray-600">
                Tell us a bit more so our specialists can create your perfect {formData.duration}-day journey
              </p>
            </div>

            {/* Trip Summary Box */}
            <div className="bg-gradient-to-br from-[#C5B097]/10 to-transparent rounded-xl p-4 mb-6 border border-[#C5B097]/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Travelers</div>
                  <div className="font-semibold text-[#2C3E50]">{formData.groupSize} guests</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="font-semibold text-[#2C3E50]">{formData.duration} days</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Travel Style</div>
                  <div className="font-semibold text-[#2C3E50]">{formData.tripType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Budget</div>
                  <div className="font-semibold text-[#2C3E50]">
                    {formData.budgetRange.split('(')[0].trim()}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customization Requests */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  What would you like to customize? (Optional)
                </label>
                <textarea
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  placeholder="e.g., Add an extra day in Luxor, upgrade to 5-star Nile cruise, include hot air balloon ride..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#2C3E50] focus:border-[#C5B097] focus:ring-2 focus:ring-[#C5B097]/20 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  How should we contact you?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setContactMethod('email')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                      contactMethod === 'email'
                        ? 'border-[#C5B097] bg-[#C5B097]/10 text-[#C5B097]'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    📧 Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('whatsapp')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                      contactMethod === 'whatsapp'
                        ? 'border-[#25D366] bg-[#25D366]/10 text-[#25D366]'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('both')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                      contactMethod === 'both'
                        ? 'border-[#C5B097] bg-[#C5B097]/10 text-[#C5B097]'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    ✨ Both
                  </button>
                </div>
              </div>

              {/* Phone Number (if WhatsApp selected) */}
              {(contactMethod === 'whatsapp' || contactMethod === 'both') && (
                <div className="animate-fadeInUp">
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required={contactMethod === 'whatsapp' || contactMethod === 'both'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#2C3E50] focus:border-[#C5B097] focus:ring-2 focus:ring-[#C5B097]/20 outline-none transition-all shadow-sm"
                  />
                </div>
              )}

              {/* Email Confirmation */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p>
                  📬 We'll send your quote to: <strong className="text-[#2C3E50]">{formData.email}</strong>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-[#C5B097] text-white py-4 rounded-full font-bold text-lg hover:bg-[#B5A087] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Preparing Email...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Request My Final Quote
                  </>
                )}
              </button>

              {/* Assurance Text */}
              <div className="text-center space-y-2 pt-2">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Response within 24 hours
                </p>
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  No payment required
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
