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
        <span className="text-[#C5B097] font-serif tracking-widest text-xs uppercase font-bold">
          Planning Your Journey
        </span>
        <span className="text-[#2C3E50]/60 font-sans text-xs">
          Step <span className="text-[#2C3E50] font-medium">{currentStep + 1}</span> / {totalSteps}
        </span>
      </div>
      <div className="h-[2px] w-full bg-[#2C3E50]/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#C5B097] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(197,176,151,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
