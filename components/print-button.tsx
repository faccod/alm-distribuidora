'use client';
import { Printer } from 'lucide-react';
import { Button } from './ui/button';

export function PrintButton({ className }: { className?: string }) {
  return (
    <Button onClick={() => window.print()} className={className}>
      <Printer className="w-4 h-4" />Imprimir
    </Button>
  );
}
