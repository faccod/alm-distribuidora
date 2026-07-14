'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';

export default function ThemeBackButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <Button variant="ghost" size="icon" onClick={() => router.push(href)}>
      <ChevronLeft className="w-5 h-5" />
    </Button>
  );
}
