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
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo dan Nama */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-supabase-green flex items-center justify-center">
                <GraduationCap className="text-white" size={16} />
              </div>
              <Button 
                variant="ghost" 
                className="font-bold bg-gradient-to-r from-supabase-green to-purple-500 bg-clip-text text-transparent p-0 h-auto hover:bg-transparent"
                onClick={handleDashboardClick}
              >
                Alifa Institute
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${
                      isActive ? 'text-primary font-medium bg-primary/10' : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted/50"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut size={16} />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Menu size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo dan Nama */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-supabase-green flex items-center justify-center">
              <GraduationCap className="text-white" size={16} />
            </div>
            <span className="font-bold bg-gradient-to-r from-supabase-green to-purple-500 bg-clip-text text-transparent">
              Alifa Institute
            </span>
          </div>

          {/* Desktop Navigation - Publik */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors">Beranda</Link>
            <Link href="/tentang" className="text-sm hover:text-primary transition-colors">Tentang</Link>
            <Link href="/kontak" className="text-sm hover:text-primary transition-colors">Kontak</Link>
            <ModeToggle />
            <Button asChild size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
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
                      <div className="w-8 h-8 rounded-full bg-supabase-green flex items-center justify-center">
                        <GraduationCap className="text-white" size={16} />
                      </div>
                      <span className="font-medium">Alifa Institute</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Sistem Pembelajaran Terpadu</p>
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
      return '/super-admin/dashboard';
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
          <div className="w-8 h-8 rounded-full bg-supabase-green flex items-center justify-center">
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
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
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