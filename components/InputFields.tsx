import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-2 w-full animate-fadeInUp">
    <label className="text-sm text-[#C9A76B] font-serif uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className={`
        w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder-white/20
        outline-none transition-all duration-300
        focus:bg-white/10 focus:border-[#C9A76B] focus:ring-1 focus:ring-[#C9A76B] focus:scale-[1.01]
        ${error ? 'border-red-500/50' : 'border-white/10'}
      `}
    />
    {error && <span className="text-red-400 text-xs mt-1 animate-pulse">{error}</span>}
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-2 w-full animate-fadeInUp">
    <label className="text-sm text-[#C9A76B] font-serif uppercase tracking-wider">{label}</label>
    <textarea
      {...props}
      className={`
        w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder-white/20
        outline-none transition-all duration-300 min-h-[120px] resize-none
        focus:bg-white/10 focus:border-[#C9A76B] focus:ring-1 focus:ring-[#C9A76B] focus:scale-[1.01]
        ${error ? 'border-red-500/50' : 'border-white/10'}
      `}
    />
    {error && <span className="text-red-400 text-xs mt-1 animate-pulse">{error}</span>}
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
        ? 'bg-[#C9A76B]/20 border-[#C9A76B] shadow-[0_0_20px_rgba(201,167,107,0.15)]' 
        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
    `}
  >
    <div className="flex items-center gap-3">
      {icon && <div className={selected ? 'text-[#C9A76B]' : 'text-white/60'}>{icon}</div>}
      <div>
        <h3 className={`font-serif text-lg ${selected ? 'text-[#C9A76B]' : 'text-white'}`}>{title}</h3>
        <p className="text-white/60 text-sm font-sans leading-relaxed">{description}</p>
      </div>
    </div>
    {selected && (
      <div className="absolute inset-0 border-2 border-[#C9A76B] rounded-xl pointer-events-none opacity-50"></div>
    )}
  </div>
);
