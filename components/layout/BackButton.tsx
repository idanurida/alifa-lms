// components/layout/BackButton.tsx
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.back()}
      className="flex items-center gap-1"
    >
      <ChevronLeft size={16} />
      <span className="hidden sm:inline">Kembali</span>
    </Button>
  );
}