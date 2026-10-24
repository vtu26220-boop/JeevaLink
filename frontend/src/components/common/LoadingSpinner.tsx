import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeClasses[size]} text-[#155EEF] animate-spin`} />
      {message && <p className="text-xs font-medium text-[#667085] animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-slate-100" />
            <div className="w-16 h-6 rounded-full bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="w-3/4 h-4 rounded bg-slate-100" />
            <div className="w-1/2 h-3 rounded bg-slate-100" />
          </div>
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
            <div className="w-20 h-4 rounded bg-slate-100" />
            <div className="w-24 h-8 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};
