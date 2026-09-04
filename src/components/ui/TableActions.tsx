import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface TableActionsProps {
  children: React.ReactNode;
  align?: 'right' | 'center' | 'left';
}

export function TableActions({ children, align = 'right' }: TableActionsProps) {
  const alignmentClass = 
    align === 'right' ? 'justify-end' : 
    align === 'center' ? 'justify-center' : 
    'justify-start';

  return (
    <div className={`flex items-center gap-1.5 ${alignmentClass}`}>
      {children}
    </div>
  );
}

interface ActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export function TableAction({ 
  icon: Icon, 
  label, 
  onClick, 
  href, 
  disabled, 
  disabledReason,
  variant = 'default' 
}: ActionProps) {
  
  const baseClasses = "flex items-center justify-center w-8 h-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  
  let colorClasses = "text-slate-500 hover:text-slate-900 hover:bg-slate-100";
  if (variant === 'destructive') {
    colorClasses = "text-slate-400 hover:text-red-600 hover:bg-red-50";
  } else if (variant === 'success') {
    colorClasses = "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50";
  }

  const disabledClasses = "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-500";
  
  const finalClasses = `${baseClasses} ${disabled ? disabledClasses : colorClasses}`;
  const title = disabled && disabledReason ? `${label} (${disabledReason})` : label;

  if (href && !disabled) {
    return (
      <Link href={href} className={finalClasses} title={title} aria-label={title}>
        <Icon size={16} />
      </Link>
    );
  }

  return (
    <button 
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={finalClasses}
      title={title}
      aria-label={title}
    >
      <Icon size={16} />
    </button>
  );
}
