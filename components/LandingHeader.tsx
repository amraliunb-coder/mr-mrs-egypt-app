import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Compass, Crown, Sparkles, Map, Award, Globe } from 'lucide-react';

interface LandingHeaderProps {
  onStart: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onStart }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Parallax and scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    // Trigger entrance animations
    setTimeout(() => setIsVisible(true), 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#F9F9F7] overflow-hidden">
      
      {/* --- ENHANCED HERO SECTION --- */}
      <div className="flex flex-col md:flex-row min-h-screen relative z-10">
        
        {/* LEFT COLUMN: Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-20 lg:px-24 py-20 relative bg-[#F9F9F7] z-20">
          
          {/* Elegant Gold Particles with Mouse Parallax */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-[#C5B097] rounded-full opacity-30 animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                  transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                }}
              />
            ))}
          </div>

          {/* Decorative Corner Ornament */}
          <div className="absolute top-8 left-6 md:left-16 opacity-10">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M30 0L35 25L60 30L35 35L30 60L25 35L0 30L25 25L30 0Z" fill="#C5B097"/>
            </svg>
          </div>

          <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5B097]/10 border border-[#C5B097]/30 mb-6 backdrop-blur-sm">
              <Award size={16} className="text-[#C5B097]" />
              <span className="text-[#C5B097] text-xs uppercase tracking-[0.2em] font-semibold">Est. Since 2010</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#2C3E50] leading-[1.05] mb-3">
              <span className="block">Egypt</span>
              <span className="block relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5B097] via-[#D4AF37] to-[#C5B097] animate-shimmer bg-[length:200%_auto]">
                  Reimagined
                </span>
                {/* Underline Flourish */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 opacity-50" viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path d="M0,6 Q75,0 150,6 T300,6" stroke="#C5B097" strokeWidth="2" fill="none"/>
                </svg>
              </span>
            </h1>
            
            {/* Script Tagline */}
            <p className="font-script text-[#C5B097] text-3xl md:text-4xl lg:text-5xl mt-4 mb-8 transform -rotate-1 origin-left">
              Where luxury meets eternity.
            </p>

            {/* Description with Elegant Border */}
            <div className="relative mb-10">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C5B097] to-transparent"></div>
              <p className="font-sans text-[#2C3E50]/80 text-lg md:text-xl max-w-md leading-relaxed pl-6">
                Experience the Land of Pharaohs through a lens of absolute sophistication. 
                We craft <span className="text-[#C5B097] font-semibold">bespoke journeys</span> for those who seek the exceptional.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-[#C5B097] text-white font-bold tracking-[0.1em] uppercase overflow-hidden shadow-[0_8px_30px_rgba(197,176,151,0.3)] hover:shadow-[0_12px_40px_rgba(197,176,151,0.5)] transition-all duration-300 rounded-sm"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Begin Your Journey 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#C5B097] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>
              
              <button 
                onClick={onStart}
                className="group px-8 py-4 border-2 border-[#C5B097] text-[#2C3E50] font-bold tracking-[0.1em] uppercase hover:bg-[#C5B097]/5 transition-all duration-300 rounded-sm relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Explore Experiences
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-[#C5B097]/20 flex items-center gap-8 text-sm text-[#2C3E50]/60">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#C5B097]" />
                <span>50+ Countries Served</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#C5B097]" />
                <span>15 Years Excellence</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cinematic Image with Overlay */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden bg-[#2C3E50] group">
          {/* Parallax Image - UPDATED TO USE THE STONE RELIEF AS MAIN BACKGROUND */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out will-change-transform group-hover:scale-105"
            style={{ 
              backgroundImage: 'url("https://res.cloudinary.com/drzid08rg/image/upload/q_auto,f_auto/v1764881983/asset-453083520749600768_dbxoap.jpg")',
              transform: `scale(1.15) translateY(${scrollY * 0.15}px)` 
            }}
          ></div>
          
          {/* Sophisticated Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50] via-transparent to-transparent opacity-70"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-[#F9F9F7] via-transparent to-transparent md:opacity-30 opacity-10"></div>
          
          {/* Elegant Frame Effect */}
          <div className="absolute inset-4 border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Bottom Text Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <p className="text-white/95 text-lg md:text-xl font-light tracking-wider italic font-serif text-shadow-sm">
              "A journey through time, wrapped in luxury"
            </p>
          </div>
        </div>
      </div>

      {/* --- FLOATING FEATURE CARDS WITH ENHANCED LUXURY --- */}
      <div className="relative py-24 px-6 bg-gradient-to-b from-[#F9F9F7] to-white">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#C5B097]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C5B097]/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20 -mt-32">
          
          <FeatureCard 
            icon={<Compass className="text-[#C5B097]" size={32} />}
            title="Bespoke Itineraries"
            description="Every journey is handcrafted from scratch by our expert curators. No templates, just your personal legend written in the sands of time."
            delay={0}
            isVisible={isVisible}
          />

          <FeatureCard 
            icon={<Crown className="text-[#C5B097]" size={32} />}
            title="Seamless Luxury"
            description="From private charters to exclusive temple access at dawn, we orchestrate every detail with white-glove precision and discretion."
            delay={200}
            isVisible={isVisible}
          />

          <FeatureCard 
            icon={<Map className="text-[#C5B097]" size={32} />}
            title="Expert Guidance"
            description="Led by distinguished Egyptologists who breathe life into ancient stones, revealing secrets missed by the crowds."
            delay={400}
            isVisible={isVisible}
          />

        </div>

        {/* Decorative Divider */}
        <div className="max-w-4xl mx-auto mt-20 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C5B097]/30"></div>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 0L17.5 12.5L30 15L17.5 17.5L15 30L12.5 17.5L0 15L12.5 12.5L15 0Z" fill="#C5B097" opacity="0.3"/>
            </svg>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C5B097]/30"></div>
          </div>
        </div>

        {/* Testimonial or Value Prop */}
        <div className="max-w-3xl mx-auto text-center mt-16">
          <blockquote className="text-2xl md:text-3xl font-serif text-[#2C3E50] leading-relaxed italic">
            "We don't just show you Egypt—we unveil its soul, 
            <span className="text-[#C5B097]"> one extraordinary moment at a time.</span>"
          </blockquote>
          <p className="mt-4 text-sm text-[#2C3E50]/60 tracking-wider uppercase">— Our Promise</p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay, isVisible }: any) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`
        group relative
        glass-panel p-8 rounded-none backdrop-blur-xl 
        bg-white/90 border border-[#C5B097]/20 
        transform transition-all duration-700 
        hover:-translate-y-4 hover:shadow-[0_20px_60px_rgba(197,176,151,0.2)]
        ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#C5B097]/30 transition-all group-hover:border-[#C5B097]/60"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#C5B097]/30 transition-all group-hover:border-[#C5B097]/60"></div>

      {/* Icon Container */}
      <div className="mb-6 relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C5B097]/10 to-[#C5B097]/5 flex items-center justify-center border border-[#C5B097]/20 group-hover:border-[#C5B097]/40 transition-all group-hover:scale-110 group-hover:rotate-6">
          {icon}
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-[#C5B097]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Content */}
      <h3 className="font-serif text-2xl text-[#2C3E50] mb-3 group-hover:text-[#C5B097] transition-colors">{title}</h3>
      <p className="font-sans text-gray-600 leading-relaxed text-sm">{description}</p>

      {/* Hover Accent Line */}
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C5B097] to-transparent group-hover:w-full transition-all duration-500"></div>
    </div>
  );
};
