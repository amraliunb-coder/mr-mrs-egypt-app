import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Compass, Crown, Sparkles, Map } from 'lucide-react';

interface LandingHeaderProps {
  onStart: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onStart }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Parallax and scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    // Trigger entrance animations
    setTimeout(() => setIsVisible(true), 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full bg-[#F9F9F7] overflow-hidden">
      
      {/* --- POLARIZED HERO SECTION --- */}
      <div className="flex flex-col md:flex-row min-h-screen relative z-10">
        
        {/* LEFT COLUMN: Content (Light Background) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-20 py-20 relative bg-[#F9F9F7] z-20">
          
          {/* Beige Dust Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-[#C5B097] rounded-full opacity-40 animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>

          <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#2C3E50] leading-[1.1] mb-2">
              <span className="block">Egypt</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5B097] via-[#B08D55] to-[#C5B097] animate-shimmer bg-[length:200%_auto]">
                Reimagined
              </span>
            </h1>
            
            <p className="font-script text-[#C5B097] text-3xl md:text-4xl mt-2 mb-8 transform -rotate-1 origin-left">
              Where luxury meets eternity.
            </p>

            <p className="font-sans text-[#2C3E50]/80 text-lg max-w-md leading-relaxed mb-10 border-l-2 border-[#C5B097] pl-6">
              Experience the Land of Pharaohs through a lens of absolute sophistication. 
              We craft bespoke journeys for those who seek the exceptional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-[#C5B097] text-white font-bold tracking-wider uppercase overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Creating Your Journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              
              <button 
                onClick={onStart}
                className="px-8 py-4 border border-[#C5B097] text-[#2C3E50] font-bold tracking-wider uppercase hover:bg-[#C5B097]/10 transition-colors"
              >
                Explore Experiences
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cinematic Image */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden bg-black">
          {/* Parallax Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out will-change-transform"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1548684693-4903c7344963?q=80&w=2000&auto=format&fit=crop")', // Nile/Felucca sunset
              transform: `scale(1.1) translateY(${scrollY * 0.15}px)` 
            }}
          ></div>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F7] via-transparent to-transparent md:bg-gradient-to-l md:from-[#F9F9F7] md:via-transparent md:to-transparent opacity-30"></div>
        </div>
      </div>

      {/* --- FLOATING FEATURE CARDS --- */}
      <div className="relative py-20 px-6 bg-[#F9F9F7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20 -mt-32">
          
          <FeatureCard 
            icon={<Compass className="text-[#C5B097]" size={32} />}
            title="Bespoke Itineraries"
            description="Every journey is handcrafted from scratch. No templates, just your personal legend written in the sands."
            delay={0}
            isVisible={isVisible}
          />

          <FeatureCard 
            icon={<Crown className="text-[#C5B097]" size={32} />}
            title="Luxury Made Effortless"
            description="From private charters to exclusive temple access, we handle every detail with white-glove precision."
            delay={200}
            isVisible={isVisible}
          />

          <FeatureCard 
            icon={<Map className="text-[#C5B097]" size={32} />}
            title="Local Expertise"
            description="Guided by Egyptologists who breathe life into history, showing you secrets missed by the crowds."
            delay={400}
            isVisible={isVisible}
          />

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
        glass-panel p-8 rounded-xl backdrop-blur-xl bg-white border border-[#C5B097]/20 
        transform transition-all duration-700 hover:-translate-y-3 hover:shadow-xl
        ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mb-6 bg-[#C5B097]/10 w-16 h-16 rounded-full flex items-center justify-center border border-[#C5B097]/30">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-[#2C3E50] mb-3">{title}</h3>
      <p className="font-sans text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};
