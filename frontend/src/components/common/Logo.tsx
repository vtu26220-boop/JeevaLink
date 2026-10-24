import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showTagline = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Icon: Heart + Medical Pulse + Connected Network Nodes */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#155EEF] via-[#0D9488] to-[#14B8A6] p-1.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all duration-300`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Subtle Heart Shape Path */}
          <path
            d="M20 34C20 34 7 25 7 15C7 10 11 6 16 6C18.5 6 20 8 20 8C20 8 21.5 6 24 6C29 6 33 10 33 15C33 25 20 34 20 34Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          {/* Heartbeat / Pulse Wave Line */}
          <path
            d="M9 19H14L16.5 12L20.5 25L23.5 16L25.5 19H31"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Connected Community Nodes */}
          <circle cx="7" cy="15" r="2.2" fill="#FEF08A" />
          <circle cx="33" cy="15" r="2.2" fill="#FEF08A" />
          <circle cx="20" cy="34" r="2.2" fill="#FEF08A" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-extrabold tracking-tight text-[#101828] ${textSizes[size]}`}>
            Jeeva
          </span>
          <span className={`font-extrabold tracking-tight text-[#155EEF] ${textSizes[size]}`}>
            Link
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] ml-1 mb-2"></span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-[#667085] uppercase -mt-1">
            Connecting Lives. Inspiring Hope.
          </span>
        )}
      </div>
    </Link>
  );
};
