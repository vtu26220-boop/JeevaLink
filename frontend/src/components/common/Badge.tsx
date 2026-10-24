import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'teal' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    blue: 'bg-blue-50 text-[#155EEF] border border-blue-200',
    teal: 'bg-teal-50 text-[#0D9488] border border-teal-200',
    success: 'bg-emerald-50 text-[#16A34A] border border-emerald-200',
    warning: 'bg-amber-50 text-[#D97706] border border-amber-200',
    danger: 'bg-rose-50 text-[#DC2626] border border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    neutral: 'bg-slate-100 text-[#667085] border border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const BloodGroupBadge: React.FC<{ group: string; className?: string }> = ({
  group,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs tracking-wide ${className}`}
    >
      {group}
    </span>
  );
};
