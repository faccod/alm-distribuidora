'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Package, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'inbox' | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = 'inbox', title, description, action, className }: EmptyStateProps) {
  const Icon = icon === 'package' ? Package : icon === 'inbox' ? Inbox : null;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        {Icon ? <Icon className="w-8 h-8 text-slate-400" /> : icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
