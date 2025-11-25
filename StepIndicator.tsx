import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  // Calculate percentage, clamped between 0 and 100
  const progress = Math.min(100, Math.max(0, ((currentStep + 1) / totalSteps) * 100));

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[#C9A76B] font-serif tracking-widest text-xs uppercase">
          Planning Your Journey
        </span>
        <span className="text-white/60 font-sans text-xs">
          Step <span className="text-white font-medium">{currentStep + 1}</span> / {totalSteps}
        </span>
      </div>
      <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#C9A76B] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(201,167,107,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};