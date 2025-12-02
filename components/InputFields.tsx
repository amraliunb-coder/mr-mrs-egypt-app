import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-2 w-full animate-fadeInUp">
    <label className="text-sm text-[#2C3E50] font-serif uppercase tracking-wider font-semibold">{label}</label>
    <input
      {...props}
      className={`
        w-full bg-white border rounded-lg px-4 py-3 text-[#2C3E50] placeholder-gray-400
        outline-none transition-all duration-300 shadow-sm
        focus:bg-white focus:border-[#C5B097] focus:ring-1 focus:ring-[#C5B097] focus:scale-[1.01]
        ${error ? 'border-red-500' : 'border-gray-200'}
      `}
    />
    {error && <span className="text-red-500 text-xs mt-1 animate-pulse">{error}</span>}
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-2 w-full animate-fadeInUp">
    <label className="text-sm text-[#2C3E50] font-serif uppercase tracking-wider font-semibold">{label}</label>
    <textarea
      {...props}
      className={`
        w-full bg-white border rounded-lg px-4 py-3 text-[#2C3E50] placeholder-gray-400
        outline-none transition-all duration-300 min-h-[120px] resize-none shadow-sm
        focus:bg-white focus:border-[#C5B097] focus:ring-1 focus:ring-[#C5B097] focus:scale-[1.01]
        ${error ? 'border-red-500' : 'border-gray-200'}
      `}
    />
    {error && <span className="text-red-500 text-xs mt-1 animate-pulse">{error}</span>}
  </div>
);

interface SelectCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const SelectCard: React.FC<SelectCardProps> = ({ selected, onClick, title, description, icon }) => (
  <div
    onClick={onClick}
    className={`
      cursor-pointer p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group
      ${selected 
        ? 'bg-[#C5B097]/10 border-[#C5B097] shadow-md' 
        : 'bg-white border-gray-200 hover:border-[#C5B097]/50 hover:shadow-md'}
    `}
  >
    <div className="flex items-center gap-3">
      {icon && <div className={selected ? 'text-[#C5B097]' : 'text-gray-400 group-hover:text-[#C5B097]'}>{icon}</div>}
      <div>
        <h3 className={`font-serif text-lg ${selected ? 'text-[#2C3E50]' : 'text-[#2C3E50]'}`}>{title}</h3>
        <p className="text-gray-500 text-sm font-sans leading-relaxed">{description}</p>
      </div>
    </div>
    {selected && (
      <div className="absolute inset-0 border-2 border-[#C5B097] rounded-xl pointer-events-none opacity-50"></div>
    )}
  </div>
);
