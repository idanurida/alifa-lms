// components/layout/Navbar.tsx - VERSI LENGKAP YANG SUDAH DIPERBAIKI
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/layout/ModeToggle';
import {
  Menu,
  GraduationCap,
  Users,
  BookOpen,
  MessageCircle,
  Coins,
  Home,
  Settings,
  LogOut,
  User,
  Calendar,
  FileText,
  BookA,
  FileCheck,
  TrendingUp,
  BarChart3,
  ClipboardList
} from 'lucide-react';

// Definisikan tipe untuk item navigasi
type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // PERBAIKAN: Handle dashboard redirect yang benar
  const handleDashboardClick = () => {
    if (!session?.user) {
      router.push('/');
      return;
    }

    const role = session.user.role;
    let dashboardPath = getDashboardPath(role);
    router.push(dashboardPath);
  };

  // Tunggu session di-load
  if (status === 'loading') {
    return null;
  }

  // Jika user login, tampilkan menu dashboard
  if (session?.user) {
    const user = session.user;
    const role = user.role;

    const navItems: NavItem[] = getNavItems(role);

    return (
      <nav className="sticky top-0 z-50 w-full premium-glass backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo dan Nama */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={handleDashboardClick}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 transition-all group-hover:scale-110 shadow-inner">
                <GraduationCap className="text-primary" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tighter leading-none text-primary">
                  ALIFA
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                  Institute LMS
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4 p-1.5 bg-muted/30 rounded-2xl border border-border/20 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                  >
                    <Icon size={14} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="px-3 py-1.5 bg-muted/40 rounded-full border border-border/50">
                <ModeToggle />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-destructive/10 hover:text-destructive group"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut size={18} className="transition-transform group-hover:rotate-12" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full premium-glass">
                    <Menu size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 premium-glass border-r-0">
                  <SidebarContent
                    user={user}
                    role={role}
                    navItems={navItems}
                    setSidebarOpen={setSidebarOpen}
                    onDashboardClick={handleDashboardClick}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Jika user TIDAK login, tampilkan menu publik
  return (
    <nav className="fixed top-0 z-50 w-full premium-glass backdrop-blur-2xl border-b border-border/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo dan Nama */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 transition-all group-hover:scale-110 shadow-inner">
              <GraduationCap className="text-primary" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter leading-none text-primary">
                ALIFA
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">
                Institute
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Publik */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-all relative group">
              Beranda
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/akademik" className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-all relative group">
              Akademik
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/forum" className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-all relative group">
              Forum
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>

            <div className="flex items-center gap-4 pl-4 border-l border-border/30">
              <ModeToggle />
              <Button asChild variant="premium" className="px-8 h-12 text-xs uppercase tracking-widest font-black">
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button - Publik */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Menu size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <GraduationCap className="text-white" size={16} />
                      </div>
                      <div>
                        <span className="font-medium">Alifa Institute</span>
                        <p className="text-xs text-muted-foreground mt-1">Sistem Pembelajaran Terpadu</p>
                      </div>
                    </div>
                  </div>

                  <nav className="flex-1 p-4 space-y-1">
                    <Link
                      href="/"
                      className="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Beranda
                    </Link>
                    <Link
                      href="/tentang"
                      className="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Tentang
                    </Link>
                    <Link
                      href="/kontak"
                      className="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Kontak
                    </Link>
                  </nav>

                  <div className="p-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/login" onClick={() => setSidebarOpen(false)}>Masuk</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Fungsi untuk mendapatkan item navigasi berdasarkan role - SUDAH DIPERBAIKI
function getNavItems(role: string): NavItem[] {
  const baseItems = [
    { name: 'Beranda', href: getDashboardPath(role), icon: Home },
  ];

  switch (role) {
    case 'super_admin':
      return [
        ...baseItems,
        { name: 'Manajemen Pengguna', href: '/super-admin', icon: Users },
        { name: 'Akademik', href: '/akademik', icon: GraduationCap },
        { name: 'Keuangan', href: '/keuangan', icon: Coins },
        { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
      ];
    case 'staff_akademik':
      return [
        ...baseItems,
        { name: 'Program Studi', href: '/akademik/program-studi', icon: GraduationCap },
        { name: 'Kurikulum', href: '/akademik/kurikulum', icon: BookOpen },
        { name: 'Mata Kuliah', href: '/akademik/mata-kuliah', icon: BookA },
        { name: 'Kelas', href: '/akademik/kelas', icon: BookOpen },
        { name: 'Mahasiswa', href: '/akademik/mahasiswa', icon: Users },
        { name: 'Dosen', href: '/akademik/dosen', icon: User },
        { name: 'Kalender', href: '/akademik/kalender-akademik', icon: Calendar },
      ];
    case 'staff_keuangan':
      return [
        ...baseItems,
        { name: 'Bukti Transfer', href: '/keuangan/bukti-transfer', icon: Coins },
        { name: 'Verifikasi', href: '/keuangan/verifikasi', icon: Coins },
      ];
    case 'dosen':
      return [
        ...baseItems,
        { name: 'Kelas Saya', href: '/akademik/dosen/kelas', icon: BookOpen },
        { name: 'Penilaian', href: '/akademik/dosen/penilaian', icon: BarChart3 },
        { name: 'Materi', href: '/akademik/dosen/materi', icon: FileText },
        { name: 'Presensi', href: '/akademik/dosen/presensi', icon: ClipboardList },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Kalender', href: '/akademik/kalender-akademik', icon: Calendar },
        { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
      ];
    case 'mahasiswa':
      return [
        ...baseItems,
        { name: 'KRS Saya', href: '/akademik/mahasiswa/krs', icon: FileCheck },
        { name: 'Kelas Saya', href: '/akademik/mahasiswa/kelas', icon: BookOpen },
        { name: 'Nilai Saya', href: '/akademik/mahasiswa/nilai', icon: TrendingUp },
        { name: 'Pembayaran', href: '/keuangan/bukti-transfer', icon: Coins },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Kalender', href: '/akademik/kalender-akademik', icon: Calendar },
        { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
      ];
    default:
      return baseItems;
  }
}

// Fungsi untuk mendapatkan path dashboard berdasarkan role - SUDAH DIPERBAIKI
function getDashboardPath(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/superadmin';
    case 'staff_akademik':
      return '/akademik';
    case 'staff_keuangan':
      return '/keuangan';
    case 'dosen':
      return '/dosen/dashboard'; // PERBAIKAN: dari '/akademik/dosen' ke '/dosen/dashboard'
    case 'mahasiswa':
      return '/mahasiswa/dashboard';
    default:
      return '/akademik';
  }
}

// Komponen Sidebar untuk versi mobile (login)
function SidebarContent({ user, role, navItems, setSidebarOpen, onDashboardClick }: any) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <GraduationCap className="text-white" size={16} />
          </div>
          <div>
            <span className="font-medium">Alifa Institute</span>
            <p className="text-xs text-muted-foreground">{user.name}</p>
          </div>
        </div>
        <Badge variant="outline" className="mt-2 capitalize">
          {role.replace('_', ' ')}
        </Badge>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
                }`}
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <ModeToggle />
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              signOut({ callbackUrl: '/' });
              setSidebarOpen(false);
            }}
          >
            <LogOut size={16} className="mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );
}