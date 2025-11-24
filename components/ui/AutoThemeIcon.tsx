// components/ui/AutoThemeIcon.tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AutoThemeIcon() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Client-side rendering protection
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Tampilkan placeholder kosong atau loading spinner sementara
    return <div className="w-5 h-5" />; // Placeholder ukuran ikon
  }

  // Tentukan ikon berdasarkan tema yang aktif (user preference atau system fallback)
  // Jika theme adalah 'system', gunakan systemTheme untuk ikon
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // Jika tema efektif adalah gelap, tampilkan ikon matahari (karena latar gelap, ikon terang terlihat)
  // Jika tema efektif adalah terang, tampilkan ikon bulan (karena latar terang, ikon gelap terlihat)
  const showSunIcon = effectiveTheme === 'dark';
  const showMoonIcon = effectiveTheme === 'light';

  return (
    <div className="relative w-5 h-5">
      {/* Ikon Bulan - Tampilkan jika tema terang */}
      <Moon
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          showMoonIcon ? 'opacity-100' : 'opacity-0'
        }`}
        size={20}
        aria-hidden="true"
      />
      {/* Ikon Matahari - Tampilkan jika tema gelap */}
      <Sun
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          showSunIcon ? 'opacity-100' : 'opacity-0'
        }`}
        size={20}
        aria-hidden="true"
      />
    </div>
  );
}