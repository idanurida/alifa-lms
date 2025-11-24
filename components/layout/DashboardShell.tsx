// components/layout/DashboardShell.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Coins, 
  Building, 
  User, 
  Menu, 
  ChevronLeft, 
  LogOut,
  Home,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/layout/ModeToggle'; // Pastikan komponen ini ada
import { UserRole } from '@/types/user';

interface DashboardShellProps {
  user: any;
  role: UserRole;
  greeting: string;
  children: React.ReactNode;
}

export function DashboardShell({ user, role, greeting, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItems(role);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="rounded-full">
            <Menu size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent user={user} role={role} navItems={navItems} setSidebarOpen={setSidebarOpen} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-50 md:border-r">
        <SidebarContent user={user} role={role} navItems={navItems} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile: back button */}
            <div className="flex items-center gap-3">
              {!pathname.includes('/dashboard') && !pathname.includes('/akademik') && !pathname.includes('/keuangan') && !pathname.includes('/superadmin') && !pathname.includes('/pengaturan') && (
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
              )}
              {/* Logo Header - Diperbesar 3x, tanpa teks alt */}
              <div className="hidden md:flex items-center gap-2">
                <div className="w-12 h-12 relative"> {/* Ukuran 3x lipat dari 40px */}
                  <img
                    src="/images/logo-alifa-white.png" // Pastikan path ini benar
                    alt="" // Tidak ada teks alt
                    className="w-full h-full object-contain" // Pastikan gambar mengisi kontainer dan tetap proporsional
                  />
                </div>
                <h1 className="font-semibold tracking-tight hidden md:block">
                  Alifa Institute LMS
                </h1>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <ModeToggle /> {/* Tambahkan ModeToggle di sini */}
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{user.name}</span>
              </div>
              <Badge variant="outline" className="hidden md:inline">
                {role}
              </Badge>
              <Button variant="ghost" size="icon" className="rounded-full">
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-lg font-medium">{greeting}</h2>
          </motion.div>
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 py-6 border-t">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              {/* Logo Footer - Diperbesar 3x, tanpa teks alt */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 relative"> {/* Ukuran 3x lipat dari 40px */}
                  <img
                    src="/images/logo-alifa-white.png" // Pastikan path ini benar
                    alt="" // Tidak ada teks alt
                    className="w-full h-full object-contain" // Pastikan gambar mengisi kontainer dan tetap proporsional
                  />
                </div>
                <span className="font-medium">Alifa Institute</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistem Pembelajaran Terpadu untuk Perguruan Tinggi Modern.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Tautan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/tentang" className="hover:text-primary">Tentang Kami</Link></li>
                <li><Link href="/akademik" className="hover:text-primary">Akademik</Link></li>
                <li><Link href="/keuangan" className="hover:text-primary">Keuangan</Link></li>
                <li><Link href="/kontak" className="hover:text-primary">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Dukungan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/bantuan" className="hover:text-primary">Pusat Bantuan</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/pengaturan" className="hover:text-primary">Panduan Pengguna</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Kontak</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📍 Jl. Merdeka No. 123, Jakarta</li>
                <li>📞 (021) 12345678</li>
                <li>✉️ info@alifa.ac.id</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-8 pt-8 text-center text-sm text-muted-foreground border-t border-white/10">
            <p>© 2025 Alifa Institute. Hak Cipta Dilindungi.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({ user, role, navItems, setSidebarOpen }: any) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const IconMap: Record<string, any> = {
    home: Home,
    akademik: GraduationCap,
    keuangan: Coins,
    superadmin: Building,
    pengguna: Users,
    profil: User,
    pengaturan: Settings,
    kelas: BookOpen,
    kalender: Calendar,
    laporan: FileText,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        {/* Logo Sidebar - Diperbesar 3x, tanpa teks alt */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 relative"> {/* Ukuran 3x lipat dari 40px/3 */}
            <img
              src="/images/logo-alifa-white.png" // Pastikan path ini benar
              alt="" // Tidak ada teks alt
              className="w-full h-full object-contain" // Pastikan gambar mengisi kontainer dan tetap proporsional
            />
          </div>
          <span className="font-medium">Alifa LMS</span>
        </div>
        <p className="text-xs text-muted-foreground">{user.name}</p>
        <Badge variant="outline" className="mt-1">{role}</Badge>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item: any) => {
          const Icon = IconMap[item.icon] || Home;
          const isActive = item.href === '/' ?
            pathname === '/' :
            pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-muted font-medium' : 'hover:bg-muted/50'
              }`}
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t text-xs text-muted-foreground">
        © 2025 Alifa Institute
      </div>
    </div>
  );
}

function getNavItems(role: UserRole) {
  const baseItems = [
    { name: 'Beranda', href: '/', icon: 'home' },
  ];

  switch (role) {
    case 'super_admin':
      return [
        ...baseItems,
        { name: 'Manajemen Pengguna', href: '/superadmin', icon: 'pengguna' },
        { name: 'Manajemen Akademik', href: '/akademik', icon: 'akademik' },
        { name: 'Keuangan', href: '/keuangan', icon: 'keuangan' },
        { name: 'Pengaturan', href: '/pengaturan', icon: 'pengaturan' },
      ];
    case 'staff_akademik':
      return [
        ...baseItems,
        { name: 'Program Studi', href: '/akademik/program-studi', icon: 'akademik' },
        { name: 'Kurikulum', href: '/akademik/kurikulum', icon: 'akademik' },
        { name: 'Mahasiswa', href: '/akademik/mahasiswa', icon: 'akademik' },
        { name: 'Dosen', href: '/akademik/dosen', icon: 'akademik' },
        { name: 'Kelas', href: '/akademik/kelas', icon: 'akademik' },
        { name: 'Kalender Akademik', href: '/akademik/kalender-akademik', icon: 'kalender' },
        { name: 'Laporan', href: '/laporan', icon: 'laporan' },
      ];
    case 'staff_keuangan':
      return [
        ...baseItems,
        { name: 'Bukti Transfer', href: '/keuangan/bukti-transfer', icon: 'keuangan' },
        { name: 'Verifikasi', href: '/keuangan/verifikasi', icon: 'keuangan' },
        { name: 'Laporan', href: '/keuangan/laporan', icon: 'keuangan' },
      ];
    case 'dosen':
      return [
        ...baseItems,
        { name: 'Kelas Saya', href: '/akademik/dosen/kelas', icon: 'kelas' },
        { name: 'Penilaian', href: '/akademik/dosen/penilaian', icon: 'akademik' },
        { name: 'Materi', href: '/akademik/dosen/materi', icon: 'akademik' },
      ];
    case 'mahasiswa':
      return [
        ...baseItems,
        { name: 'KRS', href: '/akademik/mahasiswa/krs', icon: 'akademik' },
        { name: 'Kelas Saya', href: '/akademik/mahasiswa/kelas', icon: 'kelas' },
        { name: 'Nilai', href: '/akademik/mahasiswa/nilai', icon: 'akademik' },
        { name: 'Pembayaran', href: '/keuangan/bukti-transfer', icon: 'keuangan' },
        { name: 'Profil', href: '/pengaturan', icon: 'profil' },
      ];
    default:
      return baseItems;
  }
}