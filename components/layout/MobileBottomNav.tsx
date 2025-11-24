// components/layout/MobileBottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Coins, 
  Building, 
  User, 
  Home,
  Settings
} from 'lucide-react';

interface MobileBottomNavProps {
  role: string; // UserRole
}

export default function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Tentukan item navigasi berdasarkan role
  const navItems = getNavItemsByRole(role);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-3 text-xs"
            >
              <motion.div
                className="text-xl"
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Icon size={18} />
              </motion.div>
              <span
                className={`mt-1 ${
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function getNavItemsByRole(role: string) {
  const commonItems = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Profil', href: '/pengaturan', icon: User },
  ];

  switch (role) {
    case 'super_admin':
      return [
        ...commonItems,
        { name: 'Akademik', href: '/akademik', icon: GraduationCap },
        { name: 'Keuangan', href: '/keuangan', icon: Coins },
      ];
    case 'staff_akademik':
      return [
        ...commonItems,
        { name: 'Akademik', href: '/akademik', icon: GraduationCap },
        { name: 'Laporan', href: '/laporan', icon: Building },
      ];
    case 'staff_keuangan':
      return [
        ...commonItems,
        { name: 'Keuangan', href: '/keuangan', icon: Coins },
        { name: 'Verifikasi', href: '/keuangan/verifikasi', icon: Building },
      ];
    case 'dosen':
      return [
        ...commonItems,
        { name: 'Kelas', href: '/akademik/dosen/kelas', icon: GraduationCap },
        { name: 'Nilai', href: '/akademik/dosen/penilaian', icon: GraduationCap },
      ];
    case 'mahasiswa':
      return [
        ...commonItems,
        { name: 'Kelas', href: '/akademik/mahasiswa/kelas', icon: GraduationCap },
        { name: 'KRS', href: '/akademik/mahasiswa/krs', icon: GraduationCap },
      ];
    default:
      return commonItems;
  }
}